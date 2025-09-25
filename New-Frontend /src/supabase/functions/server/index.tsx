import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9f9491c0/health", (c) => {
  return c.json({ status: "ok" });
});

// ========================
// MERCHANT ROUTES
// ========================

// Get merchant products
app.get("/make-server-9f9491c0/merchant/:merchantId/products", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const products = await kv.getByPrefix(`products:${merchantId}:`);
    return c.json({ products });
  } catch (error) {
    console.log("Error fetching merchant products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Add/Update product
app.post("/make-server-9f9491c0/merchant/:merchantId/products", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const productData = await c.req.json();
    const productId = productData.id || `product_${Date.now()}`;
    const key = `products:${merchantId}:${productId}`;
    
    const product = {
      id: productId,
      merchantId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      imageUrl: productData.imageUrl,
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error saving product:", error);
    return c.json({ error: "Failed to save product" }, 500);
  }
});

// Delete product
app.delete("/make-server-9f9491c0/merchant/:merchantId/products/:productId", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const productId = c.req.param("productId");
    const key = `products:${merchantId}:${productId}`;
    
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// Get merchant orders
app.get("/make-server-9f9491c0/merchant/:merchantId/orders", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const orders = await kv.getByPrefix(`orders:${merchantId}:`);
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching merchant orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Assign order to delivery person
app.post("/make-server-9f9491c0/merchant/:merchantId/orders/:orderId/assign", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const orderId = c.req.param("orderId");
    const { deliveryPersonId } = await c.req.json();
    
    const orderKey = `orders:${merchantId}:${orderId}`;
    const order = await kv.get(orderKey);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const updatedOrder = {
      ...order,
      deliveryPersonId,
      status: "assigned",
      assignedAt: new Date().toISOString()
    };
    
    await kv.set(orderKey, updatedOrder);
    
    // Add to delivery person's assigned orders
    const deliveryOrderKey = `delivery:${deliveryPersonId}:${orderId}`;
    await kv.set(deliveryOrderKey, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log("Error assigning order:", error);
    return c.json({ error: "Failed to assign order" }, 500);
  }
});

// Get merchant delivery people
app.get("/make-server-9f9491c0/merchant/:merchantId/delivery-people", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const deliveryPeople = await kv.getByPrefix(`delivery-people:${merchantId}:`);
    return c.json({ deliveryPeople });
  } catch (error) {
    console.log("Error fetching delivery people:", error);
    return c.json({ error: "Failed to fetch delivery people" }, 500);
  }
});

// Add delivery person
app.post("/make-server-9f9491c0/merchant/:merchantId/delivery-people", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const deliveryData = await c.req.json();
    const deliveryId = `delivery_${Date.now()}`;
    const key = `delivery-people:${merchantId}:${deliveryId}`;
    
    const deliveryPerson = {
      id: deliveryId,
      merchantId,
      name: deliveryData.name,
      phone: deliveryData.phone,
      email: deliveryData.email,
      status: "offline",
      createdAt: new Date().toISOString()
    };
    
    await kv.set(key, deliveryPerson);
    return c.json({ success: true, deliveryPerson });
  } catch (error) {
    console.log("Error adding delivery person:", error);
    return c.json({ error: "Failed to add delivery person" }, 500);
  }
});

// ========================
// DELIVERY ROUTES
// ========================

// Get delivery person's assigned orders
app.get("/make-server-9f9491c0/delivery/:deliveryId/orders", async (c) => {
  try {
    const deliveryId = c.req.param("deliveryId");
    const orders = await kv.getByPrefix(`delivery:${deliveryId}:`);
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching delivery orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Update delivery status
app.post("/make-server-9f9491c0/delivery/:deliveryId/status", async (c) => {
  try {
    const deliveryId = c.req.param("deliveryId");
    const { status } = await c.req.json();
    
    // Update delivery person status
    const deliveryPeople = await kv.getByPrefix(`delivery-people:`);
    const deliveryPerson = deliveryPeople.find(dp => dp.id === deliveryId);
    
    if (deliveryPerson) {
      const updatedDeliveryPerson = { ...deliveryPerson, status };
      const key = `delivery-people:${deliveryPerson.merchantId}:${deliveryId}`;
      await kv.set(key, updatedDeliveryPerson);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating delivery status:", error);
    return c.json({ error: "Failed to update status" }, 500);
  }
});

// Accept order
app.post("/make-server-9f9491c0/delivery/:deliveryId/orders/:orderId/accept", async (c) => {
  try {
    const deliveryId = c.req.param("deliveryId");
    const orderId = c.req.param("orderId");
    
    const orderKey = `delivery:${deliveryId}:${orderId}`;
    const order = await kv.get(orderKey);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const updatedOrder = {
      ...order,
      status: "accepted",
      acceptedAt: new Date().toISOString()
    };
    
    await kv.set(orderKey, updatedOrder);
    
    // Update original order
    const originalOrderKey = `orders:${order.merchantId}:${orderId}`;
    await kv.set(originalOrderKey, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log("Error accepting order:", error);
    return c.json({ error: "Failed to accept order" }, 500);
  }
});

// Update order status
app.post("/make-server-9f9491c0/delivery/:deliveryId/orders/:orderId/status", async (c) => {
  try {
    const deliveryId = c.req.param("deliveryId");
    const orderId = c.req.param("orderId");
    const { status } = await c.req.json();
    
    const orderKey = `delivery:${deliveryId}:${orderId}`;
    const order = await kv.get(orderKey);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const updatedOrder = {
      ...order,
      status,
      [`${status}At`]: new Date().toISOString()
    };
    
    await kv.set(orderKey, updatedOrder);
    
    // Update original order
    const originalOrderKey = `orders:${order.merchantId}:${orderId}`;
    await kv.set(originalOrderKey, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log("Error updating order status:", error);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// ========================
// CUSTOMER ROUTES
// ========================

// Get merchant store info and products
app.get("/make-server-9f9491c0/store/:merchantId", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    
    // Get merchant info
    const merchant = await kv.get(`merchants:${merchantId}`);
    
    // Get products
    const products = await kv.getByPrefix(`products:${merchantId}:`);
    
    return c.json({ 
      merchant: merchant || { id: merchantId, name: "Commerce Local", logo: "" },
      products 
    });
  } catch (error) {
    console.log("Error fetching store:", error);
    return c.json({ error: "Failed to fetch store" }, 500);
  }
});

// Place order
app.post("/make-server-9f9491c0/store/:merchantId/orders", async (c) => {
  try {
    const merchantId = c.req.param("merchantId");
    const orderData = await c.req.json();
    const orderId = `order_${Date.now()}`;
    const orderKey = `orders:${merchantId}:${orderId}`;
    
    const order = {
      id: orderId,
      merchantId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      items: orderData.items,
      total: orderData.total,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    await kv.set(orderKey, order);
    
    // Update product stock
    for (const item of orderData.items) {
      const productKey = `products:${merchantId}:${item.productId}`;
      const product = await kv.get(productKey);
      if (product) {
        const updatedProduct = {
          ...product,
          stock: Math.max(0, product.stock - item.quantity)
        };
        await kv.set(productKey, updatedProduct);
      }
    }
    
    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error placing order:", error);
    return c.json({ error: "Failed to place order" }, 500);
  }
});

// Get order status
app.get("/make-server-9f9491c0/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    
    // Search for order across all merchants
    const allOrders = await kv.getByPrefix("orders:");
    const order = allOrders.find(o => o.id === orderId);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log("Error fetching order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

Deno.serve(app.fetch);