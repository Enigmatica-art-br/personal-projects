from datetime import datetime
from src.database import db

class ChatMemory(db.Model):
    """Modelo para armazenar resumos da memória de chat"""
    __tablename__ = 'chat_memories'
    
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.String(100), nullable=False, index=True)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=False)  # Resumo gerado pela IA
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChatMemory {self.id}: {self.chat_id}>'
    
    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            'id': self.id,
            'chat_id': self.chat_id,
            'user_message': self.user_message,
            'ai_response': self.ai_response,
            'summary': self.summary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

