// ========================================
// 1. KHAI BÁO DỮ LIỆU BAN ĐẦU
// ========================================

const defaultProducts = [
  {
    id: 1,
    name: "Tai nghe Bluetooth",
    price: 350000,
    category: "Điện tử",
    stock: 10,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    id: 2,
    name: "Đồng hồ thời trang",
    price: 550000,
    category: "Thời trang",
    stock: 8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  },
  {
    id: 3,
    name: "Túi xách nữ",
    price: 420000,
    category: "Thời trang",
    stock: 12,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
  },
  {
    id: 4,
    name: "Kính mắt thời trang",
    price: 250000,
    category: "Phụ kiện",
    stock: 15,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
  },
];

// ========================================
// 2. LẤY DỮ LIỆU TỪ LOCAL STORAGE
// ========================================

let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let orders = JSON.parse(localStorage.getItem("orders")) || [];

let selectedCategory = "Tất cả";

let searchKeyword = "";

// ========================================
// 3. CÁC HÀM HỖ TRỢ
// ========================================

// Lưu dữ liệu vào LocalStorage

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Định dạng tiền Việt Nam

function formatMoney(number) {
  return Number(number).toLocaleString("vi-VN") + "đ";
}

// Hiển thị nội dung an toàn

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

// ========================================
// 4. CHUYỂN ĐỔI CÁC TRANG
// ========================================

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const pageName = button.dataset.page;

    // Bỏ trạng thái active của các nút

    navButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    // Ẩn tất cả các trang

    document.querySelectorAll(".page").forEach(function (page) {
      page.classList.remove("active");
    });

    // Hiện trang được chọn

    document.getElementById(pageName + "-page").classList.add("active");

    // Cập nhật dữ liệu khi chuyển trang

    if (pageName === "products") {
      renderProductTable();
    }

    if (pageName === "orders") {
      renderOrders();
      renderStatistics();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

// ========================================
// 5. HIỂN THỊ SẢN PHẨM
// ========================================

function renderProducts() {
  const productList = document.getElementById("product-list");

  const filteredProducts = products.filter(function (product) {
    const matchCategory =
      selectedCategory === "Tất cả" || product.category === selectedCategory;

    const matchSearch = product.name
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (filteredProducts.length === 0) {
    productList.innerHTML =
      '<p class="empty-message">Không tìm thấy sản phẩm.</p>';

    return;
  }

  productList.innerHTML = filteredProducts
    .map(function (product) {
      const image = product.image || "";

      return `
            <div class="product-card">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.onerror=null;this.src='https://placehold.co/500x300?text=MiniShop'"
                >

                <div class="product-info">

                    <small>${escapeHTML(product.category)}</small>

                    <h3>${escapeHTML(product.name)}</h3>

                    <p class="price">
                        ${formatMoney(product.price)}
                    </p>

                    <p style="margin-bottom:12px;font-size:13px;color:#888">
                        Còn ${product.stock} sản phẩm
                    </p>

                    <button
                        class="primary-btn"
                        onclick="addToCart(${product.id})"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        ${product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                    </button>

                </div>

            </div>
        `;
    })
    .join("");
}

// ========================================
// 6. TÌM KIẾM SẢN PHẨM
// ========================================

document
  .getElementById("search-input")
  .addEventListener("input", function (event) {
    searchKeyword = event.target.value;

    renderProducts();
  });

// ========================================
// 7. LỌC SẢN PHẨM THEO DANH MỤC
// ========================================

document.querySelectorAll(".category-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".category-btn").forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    selectedCategory = button.dataset.category;

    renderProducts();
  });
});

// ========================================
// 8. THÊM SẢN PHẨM VÀO GIỎ HÀNG
// ========================================

function addToCart(productId) {
  const product = products.find(function (item) {
    return item.id === productId;
  });

  if (!product || product.stock <= 0) {
    alert("Sản phẩm đã hết hàng!");
    return;
  }

  const cartItem = cart.find(function (item) {
    return item.productId === productId;
  });

  const currentQuantity = cartItem ? cartItem.quantity : 0;

  if (currentQuantity >= product.stock) {
    alert("Số lượng trong giỏ đã đạt giới hạn tồn kho!");
    return;
  }

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({
      productId: productId,
      quantity: 1,
    });
  }

  saveData();

  renderCart();

  alert("Đã thêm sản phẩm vào giỏ hàng!");
}

// ========================================
// 9. HIỂN THỊ GIỎ HÀNG
// ========================================

function renderCart() {
  const cartList = document.getElementById("cart-list");

  let total = 0;
  let totalQuantity = 0;

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-message">Giỏ hàng đang trống.</p>';
  } else {
    cartList.innerHTML = cart
      .map(function (item) {
        const product = products.find(function (product) {
          return product.id === item.productId;
        });

        if (!product) return "";

        const itemTotal = product.price * item.quantity;

        total += itemTotal;

        totalQuantity += item.quantity;

        return `
                <div class="cart-item">

                    <div>
                        <strong>${escapeHTML(product.name)}</strong>
                        <p>${formatMoney(product.price)}</p>
                    </div>

                    <div class="quantity-control">

                        <button onclick="changeQuantity(${product.id}, -1)">
                            -
                        </button>

                        <span>${item.quantity}</span>

                        <button onclick="changeQuantity(${product.id}, 1)">
                            +
                        </button>

                    </div>

                    <strong>${formatMoney(itemTotal)}</strong>

                    <button
                        class="remove-btn"
                        onclick="removeFromCart(${product.id})"
                    >
                        Xóa
                    </button>

                </div>
            `;
      })
      .join("");
  }

  document.getElementById("cart-total").textContent = formatMoney(total);

  document.getElementById("cart-count").textContent = totalQuantity;
}

// ========================================
// 10. THAY ĐỔI SỐ LƯỢNG SẢN PHẨM
// ========================================

function changeQuantity(productId, amount) {
  const cartItem = cart.find(function (item) {
    return item.productId === productId;
  });

  const product = products.find(function (item) {
    return item.id === productId;
  });

  if (!cartItem || !product) return;

  const newQuantity = cartItem.quantity + amount;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > product.stock) {
    alert("Không đủ số lượng trong kho!");
    return;
  }

  cartItem.quantity = newQuantity;

  saveData();

  renderCart();
}

// ========================================
// 11. XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// ========================================

function removeFromCart(productId) {
  cart = cart.filter(function (item) {
    return item.productId !== productId;
  });

  saveData();

  renderCart();
}

// ========================================
// 12. ĐẶT HÀNG
// ========================================

document.getElementById("checkout-btn").addEventListener("click", function () {
  const customerName = document.getElementById("customer-name").value.trim();

  const customerPhone = document.getElementById("customer-phone").value.trim();

  const customerAddress = document
    .getElementById("customer-address")
    .value.trim();

  // Kiểm tra thông tin khách hàng

  if (!customerName || !customerPhone || !customerAddress) {
    alert("Vui lòng nhập đầy đủ thông tin khách hàng!");
    return;
  }

  if (!/^[0-9]{10,11}$/.test(customerPhone)) {
    alert("Số điện thoại phải có 10 hoặc 11 chữ số!");
    return;
  }

  if (cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  // Kiểm tra tồn kho lần cuối

  for (const item of cart) {
    const product = products.find(function (product) {
      return product.id === item.productId;
    });

    if (!product || item.quantity > product.stock) {
      alert("Sản phẩm không đủ số lượng. Vui lòng kiểm tra lại!");
      return;
    }
  }

  // Tính tổng tiền

  let total = 0;

  const orderDetails = cart.map(function (item) {
    const product = products.find(function (product) {
      return product.id === item.productId;
    });

    total += product.price * item.quantity;

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  // Tạo đơn hàng

  const newOrder = {
    id: Date.now(),

    customerName: customerName,

    customerPhone: customerPhone,

    customerAddress: customerAddress,

    date: new Date().toLocaleDateString("vi-VN"),

    items: orderDetails,

    total: total,

    status: "Chờ xác nhận",
  };

  orders.push(newOrder);

  // Trừ số lượng tồn kho

  cart.forEach(function (item) {
    const product = products.find(function (product) {
      return product.id === item.productId;
    });

    product.stock -= item.quantity;
  });

  // Xóa giỏ hàng sau khi đặt thành công

  cart = [];

  saveData();

  renderProducts();

  renderCart();

  renderProductTable();

  // Xóa thông tin khách hàng

  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
  document.getElementById("customer-address").value = "";

  alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
});

// ========================================
// 13. THÊM VÀ SỬA SẢN PHẨM
// ========================================

const productForm = document.getElementById("product-form");

productForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const productId = document.getElementById("product-id").value;

  const name = document.getElementById("product-name").value.trim();

  const price = Number(document.getElementById("product-price").value);

  const category = document.getElementById("product-category").value;

  const stock = Number(document.getElementById("product-stock").value);

  const image = document.getElementById("product-image").value.trim();

  if (!name || price <= 0 || stock < 0) {
    alert("Vui lòng nhập thông tin sản phẩm hợp lệ!");
    return;
  }

  // Nếu có ID thì cập nhật sản phẩm

  if (productId) {
    const product = products.find(function (item) {
      return item.id === Number(productId);
    });

    if (product) {
      product.name = name;
      product.price = price;
      product.category = category;
      product.stock = stock;
      product.image = image;
    }

    alert("Cập nhật sản phẩm thành công!");
  } else {
    // Nếu không có ID thì thêm sản phẩm mới

    const newProduct = {
      id: Date.now(),

      name: name,

      price: price,

      category: category,

      stock: stock,

      image: image,
    };

    products.push(newProduct);

    alert("Thêm sản phẩm thành công!");
  }

  saveData();

  productForm.reset();

  document.getElementById("product-id").value = "";

  document.getElementById("form-title").textContent = "Thêm sản phẩm mới";

  renderProducts();

  renderProductTable();

  renderCart();
});

// ========================================
// 14. HIỂN THỊ BẢNG SẢN PHẨM
// ========================================

function renderProductTable() {
  const productTable = document.getElementById("product-table");

  if (products.length === 0) {
    productTable.innerHTML = '<tr><td colspan="5">Chưa có sản phẩm.</td></tr>';

    return;
  }

  productTable.innerHTML = products
    .map(function (product) {
      return `
            <tr>

                <td>${escapeHTML(product.name)}</td>

                <td>${escapeHTML(product.category)}</td>

                <td>${formatMoney(product.price)}</td>

                <td>${product.stock}</td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})"
                    >
                        Sửa
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})"
                    >
                        Xóa
                    </button>

                </td>

            </tr>
        `;
    })
    .join("");
}

// ========================================
// 15. CHỈNH SỬA SẢN PHẨM
// ========================================

function editProduct(productId) {
  const product = products.find(function (item) {
    return item.id === productId;
  });

  if (!product) return;

  document.getElementById("product-id").value = product.id;

  document.getElementById("product-name").value = product.name;

  document.getElementById("product-price").value = product.price;

  document.getElementById("product-category").value = product.category;

  document.getElementById("product-stock").value = product.stock;

  document.getElementById("product-image").value = product.image;

  document.getElementById("form-title").textContent = "Chỉnh sửa sản phẩm";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ========================================
// 16. XÓA SẢN PHẨM
// ========================================

function deleteProduct(productId) {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");

  if (!confirmDelete) return;

  // Không cho xóa sản phẩm đang nằm trong giỏ hàng

  const isInCart = cart.some(function (item) {
    return item.productId === productId;
  });

  if (isInCart) {
    alert("Không thể xóa sản phẩm đang có trong giỏ hàng!");
    return;
  }

  products = products.filter(function (product) {
    return product.id !== productId;
  });

  saveData();

  renderProducts();

  renderProductTable();

  alert("Đã xóa sản phẩm!");
}

// ========================================
// 17. HỦY CHỈNH SỬA
// ========================================

document.getElementById("cancel-edit").addEventListener("click", function () {
  productForm.reset();

  document.getElementById("product-id").value = "";

  document.getElementById("form-title").textContent = "Thêm sản phẩm mới";
});

// ========================================
// 18. QUẢN LÝ ĐƠN HÀNG
// ========================================

function renderOrders() {
  const orderTable = document.getElementById("order-table");

  if (orders.length === 0) {
    orderTable.innerHTML =
      '<tr><td colspan="5">Chưa có đơn hàng nào.</td></tr>';

    return;
  }

  orderTable.innerHTML = orders
    .map(function (order) {
      return `
            <tr>

                <td>#${order.id}</td>

                <td>${escapeHTML(order.customerName)}</td>

                <td>${escapeHTML(order.date)}</td>

                <td>${formatMoney(order.total)}</td>

                <td>

                    <select
                        class="status-select"
                        onchange="updateOrderStatus(${order.id}, this.value)"
                    >

                        <option value="Chờ xác nhận"
                            ${order.status === "Chờ xác nhận" ? "selected" : ""}>
                            Chờ xác nhận
                        </option>

                        <option value="Đang giao"
                            ${order.status === "Đang giao" ? "selected" : ""}>
                            Đang giao
                        </option>

                        <option value="Đã giao"
                            ${order.status === "Đã giao" ? "selected" : ""}>
                            Đã giao
                        </option>

                        <option value="Đã hủy"
                            ${order.status === "Đã hủy" ? "selected" : ""}>
                            Đã hủy
                        </option>

                    </select>

                </td>

            </tr>
        `;
    })
    .join("");
}

// ========================================
// 19. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
// ========================================

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(function (item) {
    return item.id === orderId;
  });

  if (!order) return;

  // Không cho chuyển đơn đã hủy hoặc đã giao sang trạng thái khác

  if (order.status === "Đã hủy" || order.status === "Đã giao") {
    alert("Đơn hàng đã hoàn tất hoặc bị hủy, không thể thay đổi!");
    renderOrders();
    return;
  }

  if (!["Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy"].includes(newStatus)) {
    return;
  }

  // Nếu hủy đơn, hoàn lại số lượng tồn kho

  if (newStatus === "Đã hủy") {
    order.items.forEach(function (item) {
      const product = products.find(function (product) {
        return product.id === item.productId;
      });

      if (product) {
        product.stock += item.quantity;
      }
    });
  }

  order.status = newStatus;

  saveData();

  renderOrders();

  renderStatistics();

  renderProducts();

  renderProductTable();

  alert("Đã cập nhật trạng thái đơn hàng!");
}

// ========================================
// 20. THỐNG KÊ ĐƠN HÀNG
// ========================================

function renderStatistics() {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(function (order) {
    return order.status === "Chờ xác nhận";
  }).length;

  const completedOrders = orders.filter(function (order) {
    return order.status === "Đã giao";
  }).length;

  // Chỉ tính doanh thu từ đơn đã giao

  const totalRevenue = orders.reduce(function (total, order) {
    if (order.status === "Đã giao") {
      return total + order.total;
    }

    return total;
  }, 0);

  document.getElementById("total-orders").textContent = totalOrders;

  document.getElementById("pending-orders").textContent = pendingOrders;

  document.getElementById("completed-orders").textContent = completedOrders;

  document.getElementById("total-revenue").textContent =
    formatMoney(totalRevenue);
}

// ========================================
// 21. KHỞI CHẠY WEBSITE
// ========================================

function init() {
  renderProducts();

  renderCart();

  renderProductTable();

  renderOrders();

  renderStatistics();
}

// Chạy chương trình

init();
