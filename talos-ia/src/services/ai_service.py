import os
import json
import time
import logging
import threading
from typing import List, Dict, Any, Optional
import requests
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.embedding_cache = {}
        self.cache_lock = threading.Lock()
        self.cache_file = '/tmp/embedding_cache.json'
        self._load_embedding_cache()
        
        # Tentar importar bibliotecas de IA
        self.use_advanced_embeddings = self._init_advanced_libraries()
    
    def _init_advanced_libraries(self):
        """Inicializa bibliotecas avançadas de IA se disponíveis"""
        try:
            global sentence_transformers, torch, np, TfidfVectorizer, cosine_similarity
            from sentence_transformers import SentenceTransformer
            import torch
            import numpy as np
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            
            # Inicializar modelo de embeddings
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            
            logger.info("[RAG] Bibliotecas avançadas de IA inicializadas com sucesso")
            return True
            
        except ImportError as e:
            logger.warning(f"[RAG] Bibliotecas avançadas não disponíveis: {e}")
            logger.info("[RAG] Usando fallback TF-IDF básico")
            return False
        except Exception as e:
            logger.error(f"[RAG] Erro ao inicializar bibliotecas avançadas: {e}")
            return False
    
    def _load_embedding_cache(self):
        """Carrega cache de embeddings do arquivo"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    self.embedding_cache = json.load(f)
                logger.info(f"[RAG] Cache de embeddings carregado: {len(self.embedding_cache)} entradas")
        except Exception as e:
            logger.warning(f"[RAG] Erro ao carregar cache de embeddings: {e}")
            self.embedding_cache = {}
    
    def _save_embedding_cache(self):
        """Salva cache de embeddings no arquivo"""
        try:
            with self.cache_lock:
                with open(self.cache_file, 'w') as f:
                    json.dump(self.embedding_cache, f)
        except Exception as e:
            logger.warning(f"[RAG] Erro ao salvar cache de embeddings: {e}")
    
    def _get_embeddings_with_cache(self, texts: List[str]) -> List[List[float]]:
        """Obtém embeddings com cache para performance"""
        if not self.use_advanced_embeddings:
            return []
        
        embeddings = []
        texts_to_compute = []
        indices_to_compute = []
        
        # Verificar cache primeiro
        for i, text in enumerate(texts):
            text_hash = str(hash(text))
            if text_hash in self.embedding_cache:
                embeddings.append(self.embedding_cache[text_hash])
            else:
                embeddings.append(None)
                texts_to_compute.append(text)
                indices_to_compute.append(i)
        
        # Computar embeddings para textos não encontrados no cache
        if texts_to_compute:
            try:
                new_embeddings = self.embedding_model.encode(texts_to_compute).tolist()
                
                # Atualizar cache e lista de embeddings
                with self.cache_lock:
                    for i, text in enumerate(texts_to_compute):
                        text_hash = str(hash(text))
                        self.embedding_cache[text_hash] = new_embeddings[i]
                        embeddings[indices_to_compute[i]] = new_embeddings[i]
                
                # Salvar cache periodicamente
                if len(texts_to_compute) > 5:
                    self._save_embedding_cache()
                    
            except Exception as e:
                logger.error(f"[RAG] Erro ao computar embeddings: {e}")
                return []
        
        return embeddings
    
    def semantic_search_advanced(self, query: str, documents: List[Dict], top_k: int = 5) -> List[Dict]:
        """Busca semântica avançada usando embeddings"""
        if not documents:
            return []
        
        try:
            # Extrair conteúdo dos documentos
            doc_contents = []
            for doc in documents:
                content = doc.get('content', '')
                if content:
                    # Quebrar em chunks menores para melhor precisão
                    chunks = self._chunk_text_advanced(content)
                    for chunk in chunks:
                        doc_contents.append({
                            'content': chunk,
                            'document': doc.get('filename', 'unknown'),
                            'original_doc': doc
                        })
            
            if not doc_contents:
                return []
            
            # Obter embeddings
            texts = [query] + [item['content'] for item in doc_contents]
            embeddings = self._get_embeddings_with_cache(texts)
            
            if not embeddings:
                # Fallback para busca por palavras-chave
                return self._keyword_search_fallback(query, documents, top_k)
            
            query_embedding = embeddings[0]
            doc_embeddings = embeddings[1:]
            
            # Calcular similaridades
            similarities = []
            for i, doc_embedding in enumerate(doc_embeddings):
                similarity = self._cosine_similarity(query_embedding, doc_embedding)
                similarities.append({
                    'content': doc_contents[i]['content'],
                    'document': doc_contents[i]['document'],
                    'similarity': similarity,
                    'original_doc': doc_contents[i]['original_doc']
                })
            
            # Ordenar por similaridade e retornar top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"[RAG] Erro na busca semântica: {e}")
            return self._keyword_search_fallback(query, documents, top_k)
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calcula similaridade coseno entre dois vetores"""
        try:
            if self.use_advanced_embeddings:
                import numpy as np
                vec1 = np.array(vec1)
                vec2 = np.array(vec2)
                return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))
            else:
                # Implementação básica sem numpy
                dot_product = sum(a * b for a, b in zip(vec1, vec2))
                norm1 = sum(a * a for a in vec1) ** 0.5
                norm2 = sum(b * b for b in vec2) ** 0.5
                return dot_product / (norm1 * norm2) if norm1 * norm2 > 0 else 0
        except:
            return 0
    
    def _chunk_text_advanced(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """Quebra texto em chunks inteligentes"""
        if not text or len(text) <= chunk_size:
            return [text] if text else []
        
        # Dividir por frases
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk + sentence) <= chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _keyword_search_fallback(self, query: str, documents: List[Dict], top_k: int = 5) -> List[Dict]:
        """Busca por palavras-chave como fallback"""
        keywords = [word.lower().strip() for word in query.split() if len(word) > 3]
        
        results = []
        for doc in documents:
            content = doc.get('content', '').lower()
            score = 0
            
            for keyword in keywords:
                score += content.count(keyword) * 2
            
            if score > 0:
                results.append({
                    'content': doc.get('content', ''),
                    'document': doc.get('filename', 'unknown'),
                    'similarity': score / 100,  # Normalizar
                    'original_doc': doc
                })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def process_chat_advanced(self, message: str, chat_id: str, subject: str, user_id: str) -> Dict[str, Any]:
        """Processa chat usando RAG avançado"""
        start_time = time.time()
        
        try:
            # Carregar documentos (simulado - você deve implementar a lógica real)
            documents = self._load_documents_for_subject(subject)
            
            # Busca semântica avançada
            relevant_docs = self.semantic_search_advanced(message, documents, top_k=5)
            
            # Construir contexto
            context = self._build_context_from_results(relevant_docs)
            
            # Obter histórico do chat (simulado)
            chat_history = self._get_chat_history(chat_id, user_id)
            
            # Sumarizar histórico se necessário
            summarized_history = self._summarize_history_advanced(chat_history)
            
            # Construir prompt final
            final_prompt = self._build_final_prompt(message, context, summarized_history, subject)
            
            # Chamar API de IA
            ai_response = self._call_ai_api(final_prompt)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return {
                'response': ai_response,
                'method': 'rag_advanced_gemini',
                'model': 'gemini-2.5-pro',
                'processing_time_ms': processing_time,
                'context_used': len(context) > 0,
                'relevant_documents': len(relevant_docs),
                'total_chunks_processed': len(relevant_docs)
            }
            
        except Exception as e:
            logger.error(f"[RAG] Erro no processamento avançado: {e}")
            # Fallback para método básico
            return self._process_chat_basic(message, chat_id, subject, user_id)
    
    def _load_documents_for_subject(self, subject: str) -> List[Dict]:
        """Carrega documentos para o assunto (implementação simulada)"""
        # Esta é uma implementação simulada
        # Você deve implementar a lógica real para carregar documentos
        return [
            {
                'filename': f'{subject}_doc1.pdf',
                'content': 'Conteúdo simulado do documento 1 sobre ' + subject
            },
            {
                'filename': f'{subject}_doc2.pdf', 
                'content': 'Conteúdo simulado do documento 2 sobre ' + subject
            }
        ]
    
    def _build_context_from_results(self, results: List[Dict]) -> str:
        """Constrói contexto a partir dos resultados da busca"""
        if not results:
            return ""
        
        context_parts = []
        for result in results:
            doc_name = result.get('document', 'unknown')
            content = result.get('content', '')
            similarity = result.get('similarity', 0)
            
            context_parts.append(f"[Documento: {doc_name} | Relevância: {similarity:.2f}]\n{content}\n")
        
        return "\n".join(context_parts)
    
    def _get_chat_history(self, chat_id: str, user_id: str) -> List[Dict]:
        """Obtém histórico do chat (implementação simulada)"""
        # Implementação simulada - você deve implementar a lógica real
        return []
    
    def _summarize_history_advanced(self, history: List[Dict]) -> str:
        """Sumariza histórico do chat de forma avançada"""
        if not history:
            return ""
        
        # Implementação básica de sumarização
        # Você pode melhorar isso usando IA para sumarização
        recent_messages = history[-5:]  # Últimas 5 mensagens
        
        summary_parts = []
        for msg in recent_messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')[:200]  # Limitar tamanho
            summary_parts.append(f"{role}: {content}")
        
        return "\n".join(summary_parts)
    
    def _build_final_prompt(self, message: str, context: str, history: str, subject: str) -> str:
        """Constrói prompt final para a IA"""
        prompt_parts = []
        
        if context:
            prompt_parts.append(f"Contexto relevante dos documentos:\n{context}\n")
        
        if history:
            prompt_parts.append(f"Histórico recente da conversa:\n{history}\n")
        
        prompt_parts.append(f"Assunto: {subject}")
        prompt_parts.append(f"Pergunta do usuário: {message}")
        prompt_parts.append("Por favor, responda baseado no contexto fornecido e no histórico da conversa.")
        
        return "\n".join(prompt_parts)
    
    def _call_ai_api(self, prompt: str) -> str:
        """Chama API de IA (implementação simulada)"""
        # Esta é uma implementação simulada
        # Você deve implementar a chamada real para sua API de IA preferida
        
        try:
            # Simular chamada de API
            time.sleep(0.1)  # Simular latência
            return f"Resposta simulada da IA para: {prompt[:100]}..."
            
        except Exception as e:
            logger.error(f"[RAG] Erro na chamada da API de IA: {e}")
            return "Desculpe, ocorreu um erro ao processar sua solicitação."
    
    def _process_chat_basic(self, message: str, chat_id: str, subject: str, user_id: str) -> Dict[str, Any]:
        """Método básico de fallback"""
        return {
            'response': f"Resposta básica para: {message}",
            'method': 'basic_fallback',
            'model': 'fallback',
            'processing_time_ms': 100,
            'context_used': False,
            'relevant_documents': 0,
            'total_chunks_processed': 0
        }
    
    def analyze_sentiment_advanced(self, text: str) -> Dict[str, Any]:
        """Análise de sentimento avançada"""
        positive_words = ['bom', 'ótimo', 'excelente', 'perfeito', 'maravilhoso', 'fantástico', 'incrível']
        negative_words = ['ruim', 'péssimo', 'terrível', 'horrível', 'problemático', 'difícil', 'complicado']
        
        text_lower = text.lower()
        
        positive_score = sum(text_lower.count(word) for word in positive_words)
        negative_score = sum(text_lower.count(word) for word in negative_words)
        
        if positive_score > negative_score:
            sentiment = 'positive'
            confidence = min(positive_score / (positive_score + negative_score + 1), 0.9)
        elif negative_score > positive_score:
            sentiment = 'negative'
            confidence = min(negative_score / (positive_score + negative_score + 1), 0.9)
        else:
            sentiment = 'neutral'
            confidence = 0.5
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'positive_score': positive_score,
            'negative_score': negative_score
        }

