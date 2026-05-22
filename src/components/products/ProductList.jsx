import ProductCard from './ProductCard'
import { cn } from '../../lib/cn'

export default function ProductList({ products, onChangeProduct }) {
  if (products.length === 0) {
    return (
      <p className={cn('py-8 text-center text-sm text-text-secondary')}>
        No products match your search or filter.
      </p>
    )
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3')}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onChange={onChangeProduct}
        />
      ))}
    </div>
  )
}
