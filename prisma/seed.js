const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

/**
 * Lightweight slugify for demo content.
 * (In production you may want a more robust slug generator.)
 */
function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function moneyToCents(amount) {
  return Math.round(Number(amount) * 100);
}

async function main() {
  // ✅ 0) ADMIN USER (for template)
  const adminEmail = String(process.env.ADMIN_EMAIL || "admin@admin.com").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "Admin123!").trim();

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
    },
  });

  // 1) CATEGORIES
  const categories = [
    { name: "Category One", slug: "category-one" },
    { name: "Category Two", slug: "category-two" },
    { name: "Category Three", slug: "category-three" },
    { name: "Category Four", slug: "category-four" },
    { name: "Category Five", slug: "category-five" },
    { name: "Category Six", slug: "category-six" },
    { name: "Promotions", slug: "promotions" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const cat = await prisma.category.findMany();
  const catBySlug = new Map(cat.map((c) => [c.slug, c.id]));

  // 2) PRODUCTS (15 demo items)
  const products = [
    // Monthly deals (discounted)
    { title: "Demo Product A (Bundle)", shortDesc: "Premium demo item with a discount.", categorySlug: "category-two", price: 219.99, priceOld: 329.99, sku: "NCP-0001", stock: 28, image: "/products/p1.jpeg", isFeaturedDiscounts: true, isFeaturedBest: true },
    { title: "Demo Product B (Limited)", shortDesc: "Limited edition demo item.", categorySlug: "category-three", price: 189.99, priceOld: 289.99, sku: "NCP-0002", stock: 20, image: "/products/p2.jpeg", isFeaturedDiscounts: true, isFeaturedBest: false },
    { title: "Demo Product C (Minimal)", shortDesc: "Clean look, best for everyday use.", categorySlug: "category-one", price: 159.99, priceOld: 229.99, sku: "NCP-0003", stock: 35, image: "/products/p3.jpeg", isFeaturedDiscounts: true, isFeaturedBest: true },
    { title: "Demo Product D (Kids)", shortDesc: "Colorful demo product for kids.", categorySlug: "category-four", price: 149.99, priceOld: 219.99, sku: "NCP-0004", stock: 18, image: "/products/p4.jpeg", isFeaturedDiscounts: true, isFeaturedBest: true },
    { title: "Demo Product E (Home)", shortDesc: "Hotel-style finish, dense stitching.", categorySlug: "category-six", price: 179.99, priceOld: 259.99, sku: "NCP-0005", stock: 14, image: "/products/p5.jpeg", isFeaturedDiscounts: true, isFeaturedBest: false },

    // Best sellers
    { title: "Demo Product F (Premium)", shortDesc: "Elegant texture, premium finishing.", categorySlug: "category-five", price: 349.99, priceOld: 399.99, sku: "NCP-0006", stock: 12, image: "/products/p6.jpeg", isFeaturedDiscounts: false, isFeaturedBest: true },
    { title: "Demo Product G (Striped)", shortDesc: "Breathable and durable demo item.", categorySlug: "category-three", price: 199.99, priceOld: null, sku: "NCP-0007", stock: 22, image: "/products/p2.jpeg", isFeaturedDiscounts: false, isFeaturedBest: true },
    { title: "Demo Product H (Warm)", shortDesc: "Comfortable and cozy.", categorySlug: "category-one", price: 169.99, priceOld: null, sku: "NCP-0008", stock: 30, image: "/products/p3.jpeg", isFeaturedDiscounts: false, isFeaturedBest: true },
    { title: "Demo Product I (Royal)", shortDesc: "Perfect for the cold season.", categorySlug: "category-two", price: 239.99, priceOld: null, sku: "NCP-0009", stock: 16, image: "/products/p1.jpeg", isFeaturedDiscounts: false, isFeaturedBest: true },
    { title: "Demo Product J (Pearl)", shortDesc: "Premium look and feel.", categorySlug: "category-six", price: 189.99, priceOld: null, sku: "NCP-0010", stock: 10, image: "/products/p4.jpeg", isFeaturedDiscounts: false, isFeaturedBest: true },

    // Extra demo products
    { title: "Demo Product K (Print)", shortDesc: "Playful print, comfortable material.", categorySlug: "category-four", price: 139.99, priceOld: 179.99, sku: "NCP-0011", stock: 25, image: "/products/p5.jpeg", isFeaturedDiscounts: true, isFeaturedBest: false },
    { title: "Demo Product L (White Luxe)", shortDesc: "Bright, premium vibe.", categorySlug: "category-five", price: 369.99, priceOld: 449.99, sku: "NCP-0012", stock: 8, image: "/products/p6.jpeg", isFeaturedDiscounts: true, isFeaturedBest: false },
    { title: "Demo Product M (Olive)", shortDesc: "Modern color, natural feel.", categorySlug: "category-one", price: 179.99, priceOld: null, sku: "NCP-0013", stock: 19, image: "/products/p3.jpeg", isFeaturedDiscounts: false, isFeaturedBest: false },
    { title: "Demo Product N (Geometry)", shortDesc: "Resistant print, geometric style.", categorySlug: "category-three", price: 209.99, priceOld: null, sku: "NCP-0014", stock: 17, image: "/products/p2.jpeg", isFeaturedDiscounts: false, isFeaturedBest: false },
    { title: "Demo Product O (Black)", shortDesc: "Premium look, smooth touch.", categorySlug: "category-two", price: 259.99, priceOld: 319.99, sku: "NCP-0015", stock: 11, image: "/products/p1.jpeg", isFeaturedDiscounts: true, isFeaturedBest: true },
  ];

  for (const p of products) {
    const slug = slugify(p.title);
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Missing category: ${p.categorySlug}`);

    await prisma.product.upsert({
      where: { slug },
      update: {
        title: p.title,
        shortDesc: p.shortDesc,
        sku: p.sku,
        price: moneyToCents(p.price),
        priceOld: p.priceOld ? moneyToCents(p.priceOld) : null,
        stock: p.stock,
        inStock: p.stock > 0,
        isFeaturedDiscounts: !!p.isFeaturedDiscounts,
        isFeaturedBest: !!p.isFeaturedBest,
        categoryId,
        image: p.image,
      },
      create: {
        title: p.title,
        slug,
        shortDesc: p.shortDesc,
        sku: p.sku,
        price: moneyToCents(p.price),
        priceOld: p.priceOld ? moneyToCents(p.priceOld) : null,
        stock: p.stock,
        inStock: p.stock > 0,
        isFeaturedDiscounts: !!p.isFeaturedDiscounts,
        isFeaturedBest: !!p.isFeaturedBest,
        categoryId,
        image: p.image,
      },
    });
  }

  console.log(`Admin user ensured ✅ (${adminEmail})`);
  console.log("Seed completed ✅ (admin + categories + 15 demo products)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });