from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from src.database import db

class User(db.Model):
    """Modelo de usuário do sistema"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable para login social
    
    # Informações do perfil
    profile_picture = db.Column(db.String(255), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    difficulty_level = db.Column(db.String(20), default='auto')  # auto, muito-facil, facil, medio-facil, medio, medio-dificil, dificil
    
    # Funções e permissões
    role = db.Column(db.String(50), default='student') # student, teacher, admin, developer
    is_pro = db.Column(db.Boolean, default=False)
    
    # Dados de uso
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # last_login = db.Column(db.DateTime, default=datetime.utcnow) # Removido para resolver UndefinedColumn
    
    # Relacionamentos
    chats = db.relationship('Chat', backref='user', lazy=True)
    challenges = db.relationship('Challenge', backref='creator_user', lazy=True) # Renomeado backref
    daily_usages = db.relationship('DailyUsage', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'profile_picture': self.profile_picture,
            'age': self.age,
            'difficulty_level': self.difficulty_level,
            'role': self.role,
            'is_pro': self.is_pro,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': None # Removido para resolver UndefinedColumn
        }

class DailyUsage(db.Model):
    """Modelo para registrar o uso diário do usuário"""
    __tablename__ = 'daily_usage'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    chats_created = db.Column(db.Integer, default=0)
    challenges_generated = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<DailyUsage {self.user_id} - {self.date}>'




