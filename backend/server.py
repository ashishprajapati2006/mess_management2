from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

# Security
security = HTTPBearer()

# Razorpay Client
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# SendGrid Client
sendgrid_api_key = os.environ.get('SENDGRID_API_KEY', '')

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def send_email(to_email: str, subject: str, content: str):
    if not sendgrid_api_key:
        print(f"Email would be sent to {to_email}: {subject}")
        return
    try:
        message = Mail(
            from_email=os.environ.get('SENDER_EMAIL', 'noreply@smartmess.com'),
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        sg = SendGridAPIClient(sendgrid_api_key)
        sg.send(message)
    except Exception as e:
        print(f"Email error: {e}")

# Models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # student, owner, admin
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_verified: bool = False

class MessCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    mess_type: str  # dine-in, delivery, both
    description: Optional[str] = None
    contact_number: str
    pricing_monthly: float
    pricing_weekly: float

class Mess(MessCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    menu: List[dict] = []
    rating: float = 0.0
    total_ratings: int = 0
    is_verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MenuUpdate(BaseModel):
    menu: List[dict]  # [{"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..."}]

class SubscriptionCreate(BaseModel):
    mess_id: str
    plan_type: str  # monthly, weekly
    start_date: str

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    mess_id: str
    plan_type: str
    start_date: str
    end_date: str
    status: str = "active"  # active, paused, cancelled
    payment_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MealSkip(BaseModel):
    subscription_id: str
    skip_date: str
    meal_type: str  # breakfast, lunch, dinner

class RatingCreate(BaseModel):
    mess_id: str
    rating: float
    review: Optional[str] = None

class Rating(RatingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ComplaintCreate(BaseModel):
    mess_id: str
    subject: str
    description: str

class Complaint(ComplaintCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    status: str = "pending"  # pending, resolved, dismissed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at: Optional[str] = None

class PaymentOrder(BaseModel):
    amount: float
    subscription_data: dict

# Auth Routes
@api_router.post("/auth/signup")
async def signup(user_data: UserSignup):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        phone=user_data.phone,
        is_verified=user_data.role == 'student'  # Auto-verify students
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.role)
    return {'token': token, 'user': user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    user.pop('password', None)
    return {'token': token, 'user': user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop('password', None)
    return current_user

# Mess Routes
@api_router.post("/mess", response_model=Mess)
async def create_mess(mess_data: MessCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'owner':
        raise HTTPException(status_code=403, detail="Only mess owners can create messes")
    
    mess = Mess(**mess_data.model_dump(), owner_id=current_user['id'])
    await db.messes.insert_one(mess.model_dump())
    return mess

@api_router.get("/mess/search")
async def search_messes(city: Optional[str] = None, state: Optional[str] = None):
    query = {'is_verified': True}
    if city:
        query['city'] = {'$regex': city, '$options': 'i'}
    if state:
        query['state'] = {'$regex': state, '$options': 'i'}
    
    messes = await db.messes.find(query, {'_id': 0}).to_list(100)
    return messes

@api_router.get("/mess/{mess_id}")
async def get_mess(mess_id: str):
    mess = await db.messes.find_one({'id': mess_id}, {'_id': 0})
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    return mess

@api_router.get("/mess/owner/my-messes")
async def get_owner_messes(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'owner':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messes = await db.messes.find({'owner_id': current_user['id']}, {'_id': 0}).to_list(100)
    return messes

@api_router.put("/mess/{mess_id}/menu")
async def update_menu(mess_id: str, menu_data: MenuUpdate, current_user: dict = Depends(get_current_user)):
    mess = await db.messes.find_one({'id': mess_id}, {'_id': 0})
    if not mess or mess['owner_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.messes.update_one({'id': mess_id}, {'$set': {'menu': menu_data.menu}})
    return {'message': 'Menu updated successfully'}

# Subscription Routes
@api_router.post("/subscription/create-order")
async def create_subscription_order(payment_data: PaymentOrder, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can subscribe")
    
    try:
        amount_paise = int(payment_data.amount * 100)
        order = razorpay_client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1
        })
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/subscription/verify-payment")
async def verify_payment(payment_id: str, order_id: str, signature: str, subscription_data: SubscriptionCreate, current_user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
    except:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Calculate end date
    start = datetime.fromisoformat(subscription_data.start_date)
    days = 30 if subscription_data.plan_type == 'monthly' else 7
    end_date = (start + timedelta(days=days)).isoformat()
    
    subscription = Subscription(
        student_id=current_user['id'],
        mess_id=subscription_data.mess_id,
        plan_type=subscription_data.plan_type,
        start_date=subscription_data.start_date,
        end_date=end_date,
        payment_id=payment_id
    )
    
    await db.subscriptions.insert_one(subscription.model_dump())
    
    # Send confirmation email
    mess = await db.messes.find_one({'id': subscription_data.mess_id}, {'_id': 0})
    if background_tasks:
        background_tasks.add_task(
            send_email,
            current_user['email'],
            'Subscription Confirmed',
            f"<h2>Your subscription to {mess['name']} has been confirmed!</h2><p>Plan: {subscription_data.plan_type}</p><p>Start Date: {subscription_data.start_date}</p>"
        )
    
    return subscription

@api_router.get("/subscription/my-subscriptions")
async def get_my_subscriptions(current_user: dict = Depends(get_current_user)):
    subscriptions = await db.subscriptions.find({'student_id': current_user['id']}, {'_id': 0}).to_list(100)
    
    # Enrich with mess details
    for sub in subscriptions:
        mess = await db.messes.find_one({'id': sub['mess_id']}, {'_id': 0})
        sub['mess_details'] = mess
    
    return subscriptions

@api_router.put("/subscription/{subscription_id}/pause")
async def pause_subscription(subscription_id: str, current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({'id': subscription_id}, {'_id': 0})
    if not subscription or subscription['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.subscriptions.update_one({'id': subscription_id}, {'$set': {'status': 'paused'}})
    return {'message': 'Subscription paused'}

@api_router.put("/subscription/{subscription_id}/cancel")
async def cancel_subscription(subscription_id: str, current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({'id': subscription_id}, {'_id': 0})
    if not subscription or subscription['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.subscriptions.update_one({'id': subscription_id}, {'$set': {'status': 'cancelled'}})
    return {'message': 'Subscription cancelled'}

@api_router.post("/subscription/skip-meal")
async def skip_meal(skip_data: MealSkip, current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({'id': skip_data.subscription_id}, {'_id': 0})
    if not subscription or subscription['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check 2 hour notice
    skip_datetime = datetime.fromisoformat(skip_data.skip_date)
    now = datetime.now(timezone.utc)
    if skip_datetime - now < timedelta(hours=2):
        raise HTTPException(status_code=400, detail="Meal skip requires at least 2 hours notice")
    
    skip_doc = skip_data.model_dump()
    skip_doc['id'] = str(uuid.uuid4())
    skip_doc['student_id'] = current_user['id']
    skip_doc['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.meal_skips.insert_one(skip_doc)
    return {'message': 'Meal skipped successfully'}

# Rating Routes
@api_router.post("/rating", response_model=Rating)
async def create_rating(rating_data: RatingCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can rate")
    
    rating = Rating(
        **rating_data.model_dump(),
        student_id=current_user['id'],
        student_name=current_user['name']
    )
    
    await db.ratings.insert_one(rating.model_dump())
    
    # Update mess rating
    ratings = await db.ratings.find({'mess_id': rating_data.mess_id}, {'_id': 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in ratings) / len(ratings)
    await db.messes.update_one(
        {'id': rating_data.mess_id},
        {'$set': {'rating': avg_rating, 'total_ratings': len(ratings)}}
    )
    
    return rating

@api_router.get("/rating/mess/{mess_id}")
async def get_mess_ratings(mess_id: str):
    ratings = await db.ratings.find({'mess_id': mess_id}, {'_id': 0}).to_list(100)
    return ratings

# Complaint Routes
@api_router.post("/complaint", response_model=Complaint)
async def create_complaint(complaint_data: ComplaintCreate, current_user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can file complaints")
    
    complaint = Complaint(
        **complaint_data.model_dump(),
        student_id=current_user['id'],
        student_name=current_user['name']
    )
    
    await db.complaints.insert_one(complaint.model_dump())
    
    # Notify admin
    if background_tasks:
        background_tasks.add_task(
            send_email,
            os.environ.get('ADMIN_EMAIL', 'admin@smartmess.com'),
            'New Complaint Filed',
            f"<h2>New Complaint</h2><p>From: {current_user['name']}</p><p>Subject: {complaint_data.subject}</p>"
        )
    
    return complaint

@api_router.get("/complaint/my-complaints")
async def get_my_complaints(current_user: dict = Depends(get_current_user)):
    complaints = await db.complaints.find({'student_id': current_user['id']}, {'_id': 0}).to_list(100)
    return complaints

@api_router.get("/complaint/mess/{mess_id}")
async def get_mess_complaints(mess_id: str, current_user: dict = Depends(get_current_user)):
    mess = await db.messes.find_one({'id': mess_id}, {'_id': 0})
    if not mess or (mess['owner_id'] != current_user['id'] and current_user['role'] != 'admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    complaints = await db.complaints.find({'mess_id': mess_id}, {'_id': 0}).to_list(100)
    return complaints

# Admin Routes
@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {'_id': 0, 'password': 0}).to_list(1000)
    return users

@api_router.get("/admin/messes")
async def get_all_messes(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    messes = await db.messes.find({}, {'_id': 0}).to_list(1000)
    return messes

@api_router.put("/admin/verify-mess/{mess_id}")
async def verify_mess(mess_id: str, current_user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    mess = await db.messes.find_one({'id': mess_id}, {'_id': 0})
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    
    await db.messes.update_one({'id': mess_id}, {'$set': {'is_verified': True}})
    
    # Notify owner
    owner = await db.users.find_one({'id': mess['owner_id']}, {'_id': 0})
    if owner and background_tasks:
        background_tasks.add_task(
            send_email,
            owner['email'],
            'Mess Verified',
            f"<h2>Congratulations!</h2><p>Your mess '{mess['name']}' has been verified and is now live.</p>"
        )
    
    return {'message': 'Mess verified'}

@api_router.get("/admin/complaints")
async def get_all_complaints(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    complaints = await db.complaints.find({}, {'_id': 0}).to_list(1000)
    return complaints

@api_router.put("/admin/complaint/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.complaints.update_one(
        {'id': complaint_id},
        {'$set': {'status': 'resolved', 'resolved_at': datetime.now(timezone.utc).isoformat()}}
    )
    return {'message': 'Complaint resolved'}

@api_router.post("/admin/send-warning/{owner_id}")
async def send_warning(owner_id: str, message: str, current_user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    owner = await db.users.find_one({'id': owner_id}, {'_id': 0})
    if not owner or owner['role'] != 'owner':
        raise HTTPException(status_code=404, detail="Owner not found")
    
    if background_tasks:
        background_tasks.add_task(
            send_email,
            owner['email'],
            'Warning from Smart Mess System',
            f"<h2>Warning</h2><p>{message}</p>"
        )
    
    return {'message': 'Warning sent'}

# Owner Dashboard Stats
@api_router.get("/owner/dashboard-stats")
async def get_owner_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'owner':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messes = await db.messes.find({'owner_id': current_user['id']}, {'_id': 0}).to_list(100)
    mess_ids = [m['id'] for m in messes]
    
    subscriptions = await db.subscriptions.find({'mess_id': {'$in': mess_ids}, 'status': 'active'}, {'_id': 0}).to_list(1000)
    
    total_revenue = 0
    for sub in subscriptions:
        mess = next((m for m in messes if m['id'] == sub['mess_id']), None)
        if mess:
            price = mess['pricing_monthly'] if sub['plan_type'] == 'monthly' else mess['pricing_weekly']
            total_revenue += price
    
    avg_rating = sum(m.get('rating', 0) for m in messes) / len(messes) if messes else 0
    
    return {
        'total_messes': len(messes),
        'active_subscriptions': len(subscriptions),
        'total_revenue': total_revenue,
        'average_rating': avg_rating
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()