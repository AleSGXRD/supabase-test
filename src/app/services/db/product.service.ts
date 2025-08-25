// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Product } from '../../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private tableName = 'product'; // Cambia esto por el nombre real de tu tabla

  constructor(private supabase: SupabaseService) {}

  // CREATE - Crear un nuevo producto
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return data;
  }

  // READ - Obtener todos los productos
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  }

  // READ - Obtener un producto por ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  }

  // UPDATE - Actualizar un producto
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data;
  }

  // DELETE - Eliminar un producto
  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  }
}
