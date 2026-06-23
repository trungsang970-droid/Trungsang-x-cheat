// Dữ liệu hệ thống
let currentUser = null;
const adminPass = "CJSUFHEKKNFH3872FDJQ";
let users = JSON.parse(localStorage.getItem("users")) || [];
let depositRequests = JSON.parse(localStorage.getItem("depositRequests")) || [];
let cardRequests = JSON.parse(localStorage.getItem("cardRequests")) || [];
let keyRequests = JSON.parse(localStorage.getItem("keyRequests")) || [];

// Nhạc nền
const songs = [
    { name: "Chấp Niệm Trong Em Remix", url: "https://www.dropbox.com/s/00000/chapniem.mp3?raw=1" },
    { name: "Dù Có Cách Xa Remix", url: "https://www.dropbox.com/s/00000/cachxa.mp3?raw=1" },
    { name: "Bông Hoa Nở Muộn Remix", url: "https://www.dropbox.com/s/00000/bonghoa.mp3?raw=1" }
];
let currentSong = 0;
const bgMusic = document.getElementById("bgMusic");
const disc = document.getElementById("disc");

// Khởi tạo nhạc
bgMusic.src = songs[currentSong].url;
bgMusic.volume = 0.4;
bgMusic.play().catch(() => {});

document.getElementById("playBtn").addEventListener("click", () => {
    bgMusic.paused ? bgMusic.play() : bgMusic.pause();
});
document.getElementById("nextBtn").addEventListener("click", () => {
    currentSong = (currentSong + 1) % songs.length;
    changeSong();
});
document.getElementById("prevBtn").addEventListener("click", () => {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    changeSong();
});
document.getElementById("closeMusic").addEventListener("click", () => {
    document.querySelector(".music-player").style.display = "none";
    bgMusic.pause();
});

function changeSong() {
    bgMusic.src = songs[currentSong].url;
    document.getElementById("songName").textContent = songs[currentSong].name;
    bgMusic.play().catch(() => {});
}

// Chuyển tab đăng nhập/đăng ký
function showAuthTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach(form => form.classList.remove("active"));
    event.target.classList.add("active");
    document.getElementById(tab + "Form").classList.add("active");
}

// Đăng ký
function register() {
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value.trim();
    if (!user || !pass) return alert("Điền đủ thông tin!");
    if (users.find(u => u.username === user)) return alert("Tên tài khoản đã tồn tại!");

    const newUser = { username: user, password: pass, balance: 0, history: [], keys: [] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công! Đăng nhập để tiếp tục.");
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";
    showAuthTab("login");
}

// Đăng nhập
function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const found = users.find(u => u.username === user && u.password === pass);
    if (!found) return alert("Tài khoản hoặc mật khẩu sai!");

    currentUser = found;
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("mainContent").classList.remove("hidden");
    updateBalance();
    loadUserHistory();
    if (user === "admin") document.getElementById("adminTab").classList.remove("hidden");
}

// Cập nhật số dư
function updateBalance() {
    document.getElementById("userBalance").textContent = currentUser.balance.toLocaleString();
}

// Mua sản phẩm
function buyProduct(type, price) {
    if (!currentUser) return;
    if (currentUser.balance < price) return alert("Số dư không đủ!");

    const req = {
        id: Date.now(),
        user: currentUser.username,
        type: type,
        price: price,
        time: new Date().toLocaleString(),
        status: "Chờ Admin gửi key"
    };
    keyRequests.push(req);
    localStorage.setItem("keyRequests", JSON.stringify(keyRequests));

    // Trừ tiền ngay
    currentUser.balance -= price;
    currentUser.history.unshift({
        type: "Trừ tiền mua key",
        amount: -price,
        time: req.time,
        desc: `Mua ${type}`
    });
    localStorage.setItem("users", JSON.stringify(users));
    updateBalance();
    loadUserHistory();
    alert("Đã gửi yêu cầu, vui lòng chờ 1-10 phút!");
}

// Xác nhận nạp tiền chuyển khoản
function confirmDeposit() {
    const amount = parseInt(document.getElementById("depositAmount").value);
    if (isNaN(amount) || amount < 30000) return alert("Tối thiểu 30.000 VNĐ!");

    const req = {
        id: Date.now(),
        user: currentUser.username,
        amount: amount,
        time: new Date().toLocaleString(),
        status: "Chờ xác nhận"
    };
    depositRequests.push(req);
    localStorage.setItem("depositRequests", JSON.stringify(depositRequests));
    alert("Đã gửi yêu cầu cho Admin!");
    document.getElementById("depositAmount").value = "";
}

// Nạp thẻ cào
function submitCard() {
    const type = document.getElementById("cardType").value;
    const value = parseInt(document.getElementById("cardValue").value);
    const seri = document.getElementById("cardSeri").value.trim();
    const code = document.getElementById("cardCode").value.trim();
    if (!type || !value || !seri || !code) return alert("Điền đủ thông tin thẻ!");

    const req = {
        id: Date.now(),
        user: currentUser.username,
        type: type,
        value: value,
        seri: seri,
        code: code,
        time: new Date().toLocaleString(),
        status: "Chờ kiểm tra"
    };
    cardRequests.push(req);
    localStorage.setItem("cardRequests", JSON.stringify(cardRequests));
    alert("Đã gửi thẻ cho Admin!");
    document.getElementById("cardType").value = "";
    document.getElementById("cardValue").value = "";
    document.getElementById("cardSeri").value = "";
    document.getElementById("cardCode").value = "";
}

// Mở tab
function openTab(tabName) {
    document.querySelectorAll(".tab-link").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    event.target.classList.add("active");
    document.getElementById(tabName).classList.add("active");
}

// Bảng quản trị Admin
function openAdminPanel() {
    const panel = document.getElementById("adminPanel");
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) loadAdminData();
}

function checkAdminPass() {
    const input = document.getElementById("adminPass").value;
    if (input === adminPass) {
        document.getElementById("adminContent").classList.remove("hidden");
        loadAdminData();
    } else {
        document.getElementById("adminContent").classList.add("hidden");
    }
}

function loadAdminData() {
    // Danh sách người dùng
    const regList = document.getElementById("regList");
    regList.innerHTML = users.map(u => `<li>${u.username} | Số dư: ${u.balance.toLocaleString()} VNĐ</li>`).join("");

    // Yêu cầu nạp tiền
    const depReq = document.getElementById("adminDepositReq");
    depReq.innerHTML = depositRequests.map(r => `
        <li>${r.time} - ${r.user}: ${r.amount.toLocaleString()} VNĐ
        <button onclick="approveDeposit(${r.id})">Xác nhận</button>
        <button onclick="cancelDeposit(${r.id})">Huỷ</button>
        </li>
    `).join("");

    // Yêu cầu nạp thẻ
    const cardReq = document.getElementById("adminCardReq");
    cardReq.innerHTML = cardRequests.map(r => `
        <li>${r.time} - ${r.user}: ${r.type} ${r.value.toLocaleString()} VNĐ | Seri: ${r.seri} | Mã: ${r.code}
        <button onclick="approveCard(${r.id})">Cộng tiền</button>
        <button onclick="cancelCard(${r.id})">Huỷ</button>
        </li>
    `).join("");

    // Yêu cầu key
    const keyReq = document.getElementById("adminKeyReq");
    keyReq.innerHTML = keyRequests.map(r => `
        <li>${r.time} - ${r.user}: Mua ${r.type} ${r.price.toLocaleString()} VNĐ
        <input type="text" id="keyInput${r.id}" placeholder="Nhập key">
        <button onclick="sendKey(${r.id})">Gửi key</button>
        </li>
    `).join("");
}

// Chức năng Admin xác nhận
function approveDeposit(id) {
    const req = depositRequests.find(r => r.id === id);
    const user = users.find(u => u.username === req.user);
    user.balance += req.amount;
    user.history.unshift({ type: "Cộng tiền", amount: req.amount, time: req.time });
    depositRequests = depositRequests.filter(r => r.id !== id);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("depositRequests", JSON.stringify(depositRequests));
    loadAdminData();
    alert("Đã cộng tiền thành công!");
}

function cancelDeposit(id) {
    depositRequests = depositRequests.filter(r => r.id !== id);
    localStorage.setItem("depositRequests", JSON.stringify(depositRequests));
    loadAdminData();
}

function approveCard(id) {
    const req = cardRequests.find(r => r.id === id);
    const user = users.find(u => u.username === req.user);
    user.balance += req.value;
    user.history.unshift({ type: "Cộng tiền thẻ", amount: req.value, time: req.time });
    cardRequests = cardRequests.filter(r => r.id !== id);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("cardRequests", JSON.stringify(cardRequests));
    loadAdminData();
}

function cancelCard(id) {
    cardRequests = cardRequests.filter(r => r.id !== id);
    localStorage.setItem("cardRequests", JSON.stringify(cardRequests));
    loadAdminData();
}

function sendKey(id) {
    const key = document.getElementById(`keyInput${id}`).value.trim();
    if (!key) return alert("Nhập key!");
    const req = keyRequests.find(r => r.id === id);
    const user = users.find(u => u.username === req.user);
    user.keys.unshift({ type: req.type, key: key, time: new Date().toLocaleString() });
    keyRequests = keyRequests.filter(r => r.id !== id);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("keyRequests", JSON.stringify(keyRequests));
    loadAdminData();
    alert("Đã gửi key thành công!");
}

// Tải lịch sử người dùng
function loadUserHistory() {
    document.getElementById("keyHistory").innerHTML = currentUser.keys.map(k => `<li>${k.time} - ${k.type}: ${k.key}</li>`).join("");
    document.getElementById("transactionHistory").innerHTML = currentUser.history.map(h => `<li>${h.time} - ${h.type}: ${h.amount.toLocaleString()} VNĐ</li>`).join("");
}

// Mở Zalo hỗ trợ
function openZalo() {
    window.open("https://zalo.me/0372822927", "_blank");
}

// Khi đóng trang → reset trạng thái đăng nhập
window.addEventListener("beforeunload", () => {
    currentUser = null;
});