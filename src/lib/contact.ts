import { site } from '../data/site';

/** Número do WhatsApp só com dígitos, ou `null` se ainda não estiver configurado corretamente. */
export function whatsappNumber(): string | null {
  const digits = site.contact.whatsapp.replace(/\D/g, '');
  // DDI + DDD + número (Brasil: 55 + 2 + 8/9 dígitos = 12 ou 13 dígitos).
  return /^\d{12,15}$/.test(digits) ? digits : null;
}

/** Número para exibição. Ex.: '5583988782144' → '(83) 98878-2144'. */
export function formattedPhone(): string | null {
  const n = whatsappNumber();
  if (!n) return null;
  const local = n.startsWith('55') ? n.slice(2) : n;
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${n}`;
}

export function hasWhatsapp(): boolean {
  return whatsappNumber() !== null;
}

/** Link que abre uma conversa no WhatsApp já com a mensagem inicial. */
export function whatsappLink(message: string = site.contact.whatsappMessage): string | null {
  const number = whatsappNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Link do botão “Quero algo parecido”, com o nome da peça e da categoria na mensagem. */
export function similarLink(pieceName: string, categoryName: string): string | null {
  const message = site.contact.similarMessage.replaceAll('{peca}', pieceName).replaceAll('{categoria}', categoryName);
  return whatsappLink(message);
}

/** Perfil do Instagram validado, com o @ extraído do endereço. */
export function instagramProfile(): { url: string; handle: string } | null {
  const url = site.contact.instagram.trim();
  const match = url.match(/^https:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?(?:\?.*)?$/);
  if (!match) return null;
  return { url, handle: `@${match[1]}` };
}

export function hasAnyContact(): boolean {
  return hasWhatsapp() || instagramProfile() !== null;
}
