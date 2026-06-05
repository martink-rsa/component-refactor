import { useState } from 'react';

import type { Product } from '@/types/product';

/** Main product image plus a thumbnail strip that selects the active image. */
export function ProductGallery({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState('');
  const currentImage = selectedImage || product.images[0] || '';

  return (
    <section style={{ width: '50%' }}>
      <div>
        <img src={currentImage} alt={product.name} width={600} height={600} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {product.images.map((image) => (
          <button
            key={image}
            onClick={() => setSelectedImage(image)}
            style={{
              border:
                image === currentImage ? '2px solid black' : '1px solid #ccc',
            }}
          >
            <img src={image} alt="" width={80} height={80} />
          </button>
        ))}
      </div>
    </section>
  );
}
