from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime

from src.models.user import User, db
from src.models.chat_memory import ChatMemory

memory_bp = Blueprint("memory", __name__)
logger = logging.getLogger(__name__)

@memory_bp.route("/list", methods=["GET"])
# @jwt_required() # Removido para depuração
def list_chat_memories():
    """Lista todas as memórias de chat"""
    try:
        # Em desenvolvimento, usar usuário padrão
        user_id = 1  # ID do usuário desenvolvedor
        
        # Obter parâmetros de consulta
        chat_id = request.args.get("chat_id")
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        
        # Construir consulta
        query = ChatMemory.query
        
        if chat_id:
            query = query.filter_by(chat_id=chat_id)
        
        # Ordenar por data de criação (mais recentes primeiro)
        query = query.order_by(ChatMemory.created_at.desc())
        
        # Paginação
        memories = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            "memories": [memory.to_dict() for memory in memories.items],
            "total": memories.total,
            "pages": memories.pages,
            "current_page": page,
            "per_page": per_page,
            "has_next": memories.has_next,
            "has_prev": memories.has_prev
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar memórias de chat: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@memory_bp.route("/get/<int:memory_id>", methods=["GET"])
def get_chat_memory(memory_id):
    """Obtém uma memória específica de chat"""
    try:
        memory = ChatMemory.query.get(memory_id)
        
        if not memory:
            return jsonify({"error": "Memória não encontrada"}), 404
        
        return jsonify({"memory": memory.to_dict()}), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter memória de chat: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@memory_bp.route("/update/<int:memory_id>", methods=["PUT"])
def update_chat_memory(memory_id):
    """Atualiza uma memória específica de chat"""
    try:
        memory = ChatMemory.query.get(memory_id)
        
        if not memory:
            return jsonify({"error": "Memória não encontrada"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados JSON são obrigatórios"}), 400
        
        # Atualizar campos permitidos
        if "summary" in data:
            memory.summary = data["summary"]
        
        db.session.commit()
        
        return jsonify({
            "message": "Memória atualizada com sucesso",
            "memory": memory.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao atualizar memória de chat: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@memory_bp.route("/delete/<int:memory_id>", methods=["DELETE"])
def delete_chat_memory(memory_id):
    """Deleta uma memória específica de chat"""
    try:
        memory = ChatMemory.query.get(memory_id)
        
        if not memory:
            return jsonify({"error": "Memória não encontrada"}), 404
        
        db.session.delete(memory)
        db.session.commit()
        
        return jsonify({"message": "Memória deletada com sucesso"}), 200
        
    except Exception as e:
        logger.error(f"Erro ao deletar memória de chat: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@memory_bp.route("/delete-by-chat/<chat_id>", methods=["DELETE"])
def delete_chat_memories_by_chat(chat_id):
    """Deleta todas as memórias de um chat específico"""
    try:
        memories = ChatMemory.query.filter_by(chat_id=chat_id).all()
        
        if not memories:
            return jsonify({"message": "Nenhuma memória encontrada para este chat"}), 200
        
        for memory in memories:
            db.session.delete(memory)
        
        db.session.commit()
        
        return jsonify({
            "message": f"{len(memories)} memórias deletadas com sucesso",
            "deleted_count": len(memories)
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao deletar memórias do chat: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@memory_bp.route("/stats", methods=["GET"])
def get_memory_stats():
    """Obtém estatísticas das memórias de chat"""
    try:
        total_memories = ChatMemory.query.count()
        unique_chats = db.session.query(ChatMemory.chat_id).distinct().count()
        
        # Memórias por chat (top 10)
        chat_counts = db.session.query(
            ChatMemory.chat_id,
            db.func.count(ChatMemory.id).label("count")
        ).group_by(ChatMemory.chat_id).order_by(db.func.count(ChatMemory.id).desc()).limit(10).all()
        
        return jsonify({
            "total_memories": total_memories,
            "unique_chats": unique_chats,
            "top_chats": [{"chat_id": chat_id, "memory_count": count} for chat_id, count in chat_counts]
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de memória: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500



