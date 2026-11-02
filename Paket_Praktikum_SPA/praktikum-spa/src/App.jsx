import { useEffect } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router";
import { useFavorites } from "./hooks/useFavorites";

const PRODUCTS = [
  { id: 1, name: "Buku React", category: "Buku", price: 85000 },
  { id: 2, name: "Buku Web", category: "Buku", price: 70000 },
  { id: 3, name: "Keyboard", category: "Elektronik", price: 150000 },
  { id: 4, name: "Mouse", category: "Elektronik", price: 90000 },
];

const CATEGORIES = ["Semua", "Buku", "Elektronik"];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export default function App() {
  const { ids, storageError } = useFavorites();
  return (
    <>
      <header>
        <h1>Katalog Praktikum</h1>
        <nav aria-label="Navigasi utama">
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <NavLink to="/products">Produk</NavLink>
          <NavLink to="/favorites">Favorit ({ids.length})</NavLink>
          <NavLink to="/about">Tentang</NavLink>
        </nav>
      </header>
      <main>
        {storageError && <p role="alert">{storageError}</p>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/products/:id" element={<Detail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function Home() {
  usePageTitle("Beranda Katalog");
  return (
    <section>
      <h2>Selamat datang</h2>
      <p>Pilih produk dan simpan sebagai favorit.</p>
      <Link to="/products">Buka katalog</Link>
    </section>
  );
}

function About() {
  usePageTitle("Tentang Aplikasi");
  return (
    <section>
      <h2>Tentang Aplikasi</h2>
      <p>
        Aplikasi Katalog SPA ini dibangun menggunakan React, React Router v7,
        dan Custom Hooks untuk manajemen state persisten.
      </p>
    </section>
  );
}

function ProductCard({ product }) {
  const { ids, toggle } = useFavorites();
  const selected = ids.includes(product.id);
  return (
    <article className="card">
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <p>
        Kategori: <strong>{product.category}</strong>
      </p>
      <p>{rupiah(product.price)}</p>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => toggle(product.id)}
      >
        {selected ? "Hapus favorit" : "Tambah favorit"}
      </button>
    </article>
  );
}

function Catalog() {
  usePageTitle("Katalog Produk");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "Semua";

  const filtered = PRODUCTS.filter((product) => {
    const matchQuery = product.name.toLowerCase().includes(q.toLowerCase());
    const matchCategory = category === "Semua" || product.category === category;
    return matchQuery && matchCategory;
  });

  function updateParams(newParams, replace = true) {
    const next = new URLSearchParams(params);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== "Semua") {
        next.set(key, val);
      } else {
        next.delete(key);
      }
    });
    setParams(next, { replace });
  }

  return (
    <section>
      <h2>Produk</h2>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div>
          <label htmlFor="search">Cari produk: </label>
          <input
            id="search"
            value={q}
            onChange={(e) => updateParams({ q: e.target.value })}
            placeholder="Contoh Buku"
          />
        </div>
        <div>
          <label htmlFor="category">Kategori: </label>
          <select
            id="category"
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
            style={{ padding: "10px" }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => setParams({}, { replace: false })}>
          Reset Filter
        </button>
      </div>

      <p>{filtered.length} produk ditemukan</p>
      <div className="grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filtered.length === 0 && <p>Produk tidak ditemukan.</p>}
    </section>
  );
}

function Detail() {
  const { id } = useParams();
  const product = PRODUCTS.find((item) => String(item.id) === id);
  usePageTitle(product ? product.name : "Produk tidak ditemukan");
  return (
    <section>
      <h2>Detail produk</h2>
      {product ? (
        <ProductCard product={product} />
      ) : (
        <p>ID produk tidak tersedia.</p>
      )}
      <Link to="/products">Kembali ke katalog</Link>
    </section>
  );
}

function Favorites() {
  usePageTitle("Produk Favorit");
  const { ids, toggle } = useFavorites();
  const selected = PRODUCTS.filter((item) => ids.includes(item.id));

  function clearAll() {
    ids.forEach((id) => toggle(id));
  }

  return (
    <section>
      <h2>Produk favorit</h2>
      {selected.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          style={{ marginBottom: "15px", background: "#ffdddd", color: "#a00" }}
        >
          Hapus semua favorit
        </button>
      )}
      <div className="grid">
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {selected.length === 0 && <p>Belum ada produk favorit.</p>}
    </section>
  );
}

function NotFound() {
  usePageTitle("Halaman tidak ditemukan");
  return (
    <section>
      <h2>Halaman tidak ditemukan</h2>
      <Link to="/">Kembali ke beranda</Link>
    </section>
  );
}
