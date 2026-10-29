import { createClient } from '@supabase/supabase-js';

// Conexão com o Supabase do ecossistema LMA / Flamar
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bvijihrulhxagnvqudaw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aWppaHJ1bGh4YWdudnF1ZGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjYwOTgsImV4cCI6MjA5NzUwMjA5OH0.1XVsA684DU4j8sZ1Ajr7yd1i7SU0mxQeTbC5z9WQIp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

export const FLAMAR_BUCKET = 'flamar-colchoes';

/**
 * Otimiza e redimensiona a imagem no navegador antes do upload:
 * - Mantém proporção perfeita
 * - Redimensiona para no máximo 1200px (ideal para e-commerce / vitrine)
 * - Converte para WebP com qualidade 88% (peso levíssimo ~80-150KB sem nenhuma perda visível)
 */
export async function otimizarImagem(file: File, maxLado = 1200, qualidade = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const escala = Math.min(1, maxLado / Math.max(width, height));
        const w = Math.round(width * escala);
        const h = Math.round(height * escala);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível inicializar canvas 2D'));
          return;
        }

        // Suavização de alta fidelidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao gerar blob otimizado'));
            }
          },
          'image/webp',
          qualidade
        );
      };
      img.onerror = () => reject(new Error('Erro ao carregar arquivo de imagem'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload do blob otimizado diretamente para o bucket exclusivo 'flamar-colchoes'.
 * Retorna a URL pública definitiva.
 */
export async function uploadFotoProduto(blob: Blob, skuOuId: string): Promise<string> {
  const safeName = (skuOuId || 'prod')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const path = `produtos/${safeName}_${Date.now()}.webp`;

  const { error } = await supabase.storage
    .from(FLAMAR_BUCKET)
    .upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true
    });

  if (error) {
    throw new Error(`Erro ao enviar foto para o Supabase: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(FLAMAR_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
