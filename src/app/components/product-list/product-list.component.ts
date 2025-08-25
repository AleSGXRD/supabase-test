// src/app/components/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../model/product.model';
import { ProductService } from '../../services/db/product.service';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentProduct: Partial<Product> = { name: '', price: 0 };
  editingProduct: Product | null = null;
  loading = false;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading = true;
    this.error = null;

    try {
      this.products = await this.productService.getProducts();
    } catch (err) {
      this.error = 'Error al cargar los productos';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.editingProduct) {
      await this.updateProduct();
    } else {
      await this.createProduct();
    }
  }

  async createProduct() {
    this.error = null;
    try {
      const newProduct = await this.productService.createProduct({
        name: this.currentProduct.name!,
        price: this.currentProduct.price!
      });

      if (newProduct) {
        this.products.unshift(newProduct);
        this.resetForm();
        this.loadProducts(); // Recargar para asegurar consistencia
      }
    } catch (err) {
      this.error = 'Error al crear el producto';
      console.error(err);
    }
  }

  async updateProduct() {
    if (!this.editingProduct) return;

    this.error = null;
    try {
      const updatedProduct = await this.productService.updateProduct(
        this.editingProduct.id,
        {
          name: this.currentProduct.name!,
          price: this.currentProduct.price!
        }
      );

      if (updatedProduct) {
        const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.cancelEdit();
      }
    } catch (err) {
      this.error = 'Error al actualizar el producto';
      console.error(err);
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = { ...product };
  }

  cancelEdit() {
    this.editingProduct = null;
    this.resetForm();
  }

  resetForm() {
    this.currentProduct = { name: '', price: 0 };
  }

  async deleteProduct(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.error = null;
    try {
      const success = await this.productService.deleteProduct(id);
      if (success) {
        this.products = this.products.filter(p => p.id !== id);
      }
    } catch (err) {
      this.error = 'Error al eliminar el producto';
      console.error(err);
    }
  }
}
