import { site } from '../data/site';
import { assetUrl } from '../lib/asset';

interface BrandProps {
  /** `compact`: sem o slogan (cabeçalho). `full`: logo completa (rodapé). */
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Marca da LOOP. Usa os arquivos definidos em `site.brand`; se eles forem
 * removidos, o nome aparece em texto, sem redesenhar o símbolo.
 */
export function Brand({ variant = 'compact', className = '' }: BrandProps) {
  const { logo, logoFull, wordmark, name } = site.brand;
  const image = variant === 'full' ? (logoFull ?? logo) : logo;

  return (
    <a className={`brand brand--${variant} ${className}`.trim()} href="#inicio" aria-label={`${name}, voltar ao início`}>
      {image ? (
        <img
          className="brand__logo"
          src={assetUrl(image.src)}
          alt=""
          width={image.width}
          height={image.height}
          decoding="async"
          loading={variant === 'full' ? 'lazy' : undefined}
        />
      ) : (
        <span className="brand__wordmark" aria-hidden="true">
          <span className="brand__primary">{wordmark.primary}</span>
          <span className="brand__secondary">{wordmark.secondary}</span>
        </span>
      )}
    </a>
  );
}
