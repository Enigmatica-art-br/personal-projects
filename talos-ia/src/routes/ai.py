from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.ai_service import AIService
import logging
import time

ai_bp = Blueprint('ai', __name__)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Rota principal de chat com autenticação JWT obrigatória"""
    start_time = time.time()
    
    try:
        # Obter dados da requisição
        data = request.get_json()
        if not data:
            logger.error("[RAG] Dados da requisição não encontrados")
            return jsonify({'error': 'Dados da requisição não encontrados'}), 400
        
        message = data.get('message', '').strip()
        chat_id = data.get('chat_id', '')
        subject = data.get('subject', '')
        
        if not message:
            logger.error("[RAG] Mensagem vazia")
            return jsonify({'error': 'Mensagem não pode estar vazia'}), 400
        
        # Obter ID do usuário do JWT
        user_id = get_jwt_identity()
        
        logger.info(f"[RAG] Chat request - User: {user_id}, Chat: {chat_id}, Subject: {subject}")
        
        # Processar com AI Service
        ai_service = AIService()
        
        # Usar método avançado de RAG
        response_data = ai_service.process_chat_advanced(
            message=message,
            chat_id=chat_id,
            subject=subject,
            user_id=user_id
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Adicionar métricas de performance
        response_data['rag_metrics'] = {
            'processing_time_ms': processing_time,
            'user_id': user_id,
            'chat_id': chat_id
        }
        
        logger.info(f"[RAG] Resposta gerada com sucesso para chat {chat_id} em {processing_time}ms")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        logger.error(f"[RAG] Erro no processamento do chat: {str(e)} (tempo: {processing_time}ms)")
        return jsonify({
            'error': 'Erro interno do servidor',
            'details': str(e),
            'processing_time_ms': processing_time
        }), 500

@ai_bp.route('/chat-dev', methods=['POST'])
def chat_dev():
    """Rota de desenvolvimento sem autenticação JWT para testes"""
    start_time = time.time()
    
    try:
        # Obter dados da requisição
        data = request.get_json()
        if not data:
            logger.error("[RAG-DEV] Dados da requisição não encontrados")
            return jsonify({'error': 'Dados da requisição não encontrados'}), 400
        
        message = data.get('message', '').strip()
        chat_id = data.get('chat_id', 'dev-chat')
        subject = data.get('subject', 'desenvolvimento')
        
        if not message:
            logger.error("[RAG-DEV] Mensagem vazia")
            return jsonify({'error': 'Mensagem não pode estar vazia'}), 400
        
        # Usar ID de usuário fictício para desenvolvimento
        user_id = 'dev-user'
        
        logger.info(f"[RAG-DEV] Chat request - User: {user_id}, Chat: {chat_id}, Subject: {subject}")
        
        # Processar com AI Service
        ai_service = AIService()
        
        # Usar método avançado de RAG
        response_data = ai_service.process_chat_advanced(
            message=message,
            chat_id=chat_id,
            subject=subject,
            user_id=user_id
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Adicionar métricas de performance
        response_data['rag_metrics'] = {
            'processing_time_ms': processing_time,
            'user_id': user_id,
            'chat_id': chat_id,
            'dev_mode': True
        }
        
        logger.info(f"[RAG-DEV] Resposta gerada com sucesso para chat {chat_id} em {processing_time}ms")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        logger.error(f"[RAG-DEV] Erro no processamento do chat: {str(e)} (tempo: {processing_time}ms)")
        return jsonify({
            'error': 'Erro interno do servidor',
            'details': str(e),
            'processing_time_ms': processing_time,
            'dev_mode': True
        }), 500

def chunk_text_intelligently(text, chunk_size=1000, overlap=200):
    """
    Quebra o texto em chunks inteligentes, preservando frases completas
    """
    if not text or len(text) <= chunk_size:
        return [text] if text else []
    
    # Dividir por frases primeiro
    sentences = text.replace('!', '.').replace('?', '.').split('.')
    sentences = [s.strip() + '.' for s in sentences if s.strip()]
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # Se adicionar esta frase não ultrapassar o limite, adicione
        if len(current_chunk + sentence) <= chunk_size:
            current_chunk += sentence + " "
        else:
            # Se o chunk atual não está vazio, salve-o
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            
            # Comece um novo chunk com esta frase
            current_chunk = sentence + " "
    
    # Adicionar o último chunk se não estiver vazio
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    # Adicionar sobreposição entre chunks
    overlapped_chunks = []
    for i, chunk in enumerate(chunks):
        if i > 0 and overlap > 0:
            # Pegar as últimas palavras do chunk anterior
            prev_words = chunks[i-1].split()[-overlap//10:]  # Aproximadamente overlap/10 palavras
            overlap_text = " ".join(prev_words)
            chunk = overlap_text + " " + chunk
        
        overlapped_chunks.append(chunk)
    
    return overlapped_chunks

def get_document_context_advanced(message, documents, max_context_length=3000):
    """
    Obtém contexto relevante dos documentos usando busca por palavras-chave avançada
    """
    if not documents:
        return ""
    
    # Extrair palavras-chave da mensagem
    keywords = [word.lower().strip() for word in message.split() if len(word) > 3]
    
    relevant_chunks = []
    
    for doc in documents:
        content = doc.get('content', '')
        if not content:
            continue
        
        # Quebrar documento em chunks
        chunks = chunk_text_intelligently(content)
        
        # Pontuar cada chunk baseado na relevância
        for chunk in chunks:
            chunk_lower = chunk.lower()
            score = 0
            
            # Contar ocorrências de palavras-chave
            for keyword in keywords:
                score += chunk_lower.count(keyword) * 2
            
            # Bonus para chunks que contêm múltiplas palavras-chave
            keyword_count = sum(1 for keyword in keywords if keyword in chunk_lower)
            if keyword_count > 1:
                score += keyword_count * 3
            
            if score > 0:
                relevant_chunks.append({
                    'content': chunk,
                    'score': score,
                    'document': doc.get('filename', 'unknown')
                })
    
    # Ordenar por relevância
    relevant_chunks.sort(key=lambda x: x['score'], reverse=True)
    
    # Construir contexto respeitando o limite
    context = ""
    total_chunks = 0
    
    for chunk_data in relevant_chunks:
        chunk_content = chunk_data['content']
        if len(context + chunk_content) <= max_context_length:
            context += f"\n[Documento: {chunk_data['document']}]\n{chunk_content}\n"
            total_chunks += 1
        else:
            break
    
    logger.info(f"[RAG] Processados {total_chunks} chunks relevantes")
    
    return context.strip()

