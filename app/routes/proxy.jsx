import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { liquid } = await authenticate.public.appProxy(request);

  // Inline CSS
  const css = `
/* Layout and Structure */
.voucher-tabs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.voucher-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.voucher-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.voucher-card-container {
  position: relative;
  margin-bottom: 20px;
}

/* Tab Navigation */
.voucher-tabs__header {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
  margin-bottom: 20px;
  font-weight: bold;
}

.voucher-tabs__tab {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  margin-right: 5px;
}

.voucher-tabs__tab.active {
  color: #1973CB;
}

.voucher-tabs__tab.active:after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1973CB;
}

.voucher-tabs__content {
  display: none;
}

.voucher-tabs__content.active {
  display: block;
}

/* Voucher Card Styles */
.voucher-card {
    border: 1px solid #e1e1e1;
    border-left: none;
    border-right: none;
    height: 120px;
    width: 530px;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    margin-right: 20px;
    position: relative;
}

.voucher-card .row {
  height: 100%;
  margin: 0;
}

.voucher-card .col-image {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  padding-left: 30px;
}

.expired, .redeemed {
  opacity: 0.4;
  filter: grayscale(100%);
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.voucher-card .col-divider {
  display: flex;
  justify-content: center;
  padding: 0;
  width: 1px;
}

.voucher-card .dotted-divider {
  height: 100%;
  width: 1px;
  background: repeating-linear-gradient(
    to bottom,
    #ccc,
    #ccc 2px,
    transparent 2px,
    transparent 4px
  );
  margin: 0 auto;
}

.voucher-card .col-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 50%;
  padding: 10px;
}

.details-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  flex-grow: 1;
}

/* Text Elements */
.card-text {
  font-size: 10px;
  font-weight: bold;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-title {
  font-size: 10px;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usage-info {
  font-size: 10px;
  font-weight: 500;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.terms-popup,
.voucher-popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.popup-content {
  background-color: #d9d9d9;
  margin: auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  overflow-y: scroll;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  font-size: 13px;
  height: 75vh;
}

.close-btn {
  color: #D9D9D9;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  position: absolute;
  top: -30px;
  right: 53px;
  width: 40px;
  height: 40px;
}

.voucher-details {
  padding-bottom: 20px;
}

.voucher-details p {
  margin: 0;
}

.terms-content p {
  color: red;
}

.terms-content ul {
  padding-left: 20px;
}

.terms-content li {
  margin-bottom: 10px;
}

.voucher-popup .popup-content {
  height: 30vh;
}

.voucher-popup .popup-content .popup-message {
  text-align: center;
  color: black;
}

/* Buttons */
.claim-button-container {
  flex-shrink: 0;
  padding-top: 0;
  align-self: flex-end;
}

.btn-claim {
  background-color: #213168;
  color: white;
  border: none;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 115px;
  text-align: center;
  justify-content: center;
}

.btn-redeemed,
.btn-expired {
  background-color: #213168;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 15px;
  cursor: not-allowed;
  width: 100%;
  font-weight: bold;
}

/* Greetings Section */
.greetings {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5px;
  line-height: 1.4;
}

.greetings .hiuser {
  margin-bottom: 30px;
}

.greetings p {
  font-size: 18px;
  margin: 10px 0;
}

/* Utility Classes */
.no-vouchers {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #0063b9;
  animation: spin 1s linear infinite;
}

.card-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-sm-6, .col-md-4, .col-lg-3 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

@media (min-width: 576px) {
  .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
}

@media (min-width: 768px) {
  .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
}

@media (min-width: 992px) {
  .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
}

.mb-4 {
  margin-bottom: 1.5rem !important;
}

.claim-points-container {
  color: #213168;
  margin-top: 15px;
}

.claim-points {
  border: 1px solid black;
  border-radius: 8px;
  font-weight: bold;
  padding: 8px 10px;
  font-size: 18px;
  background-color: #213168;
  color: white;
}

.claim-points:hover {
  color: white;
}

/* Voucher card notches */
.voucher-card::before,
.voucher-card::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 10px;
  height: 20px;
  background: #fff;
  border: 1px solid #e1e1e1;
  transform: translateY(-50%);
  z-index: 5;
}

.voucher-card::before {
  left: -2px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-left: 0;
}

.voucher-card::after {
  right: -2px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  border-right: 0;
}

.popup-image {
  text-align: center;
  margin-bottom: 15px;
}

.popup-image img {
  width: 60px;
  height: auto;
}

/* FAQ Styles */
.voucher-footer {
  padding: 0 20px;
}

.faq-title1 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
  color: #333;
}

.faq-title2 {
  font-size: 18px;
  font-weight: normal;
  margin-bottom: 30px;
  text-align: left;
  color: #666;
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.faq-item {
  border: none;
  border-bottom: 1px solid #dcdcdc;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.faq-question {
  width: 100%;
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #213168;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.faq-question:hover {
  color: #0563c1;
}

.faq-question::after {
  content: "▼";
  font-size: 0.9rem;
  color: #001E62;
  transition: transform 0.3s ease;
}

.faq-item.active .faq-question::after {
  transform: rotate(180deg);
}

.faq-answer {
  display: none;
  padding: 8px 0 12px 0;
  font-size: 0.95rem;
  color: #001E62;
  line-height: 1.6;
}

.faq-answer a {
  color: black;
  text-decoration: underline;
}

.popupframe, .popupframe2 {
  width: 80%;
  max-width: 750px;
  position: relative;
  margin: auto;
}

@media (max-width: 768px) {
  .faq-container { grid-template-columns: 1fr; }
}
`;

  // Build liquid template with inline assets
  const liquidTemplate = `
<style>
${css}
</style>

{% if customer %}
  <script type="text/javascript">
    window.customerId = "{{ customer.id }}";
  </script>
{% endif %}

<script>
  window.voucherImageMap = {
    '30welcome': '{{ "welcome30.png" | asset_url }}',
    '50welcome': '{{ "welcome50.png" | asset_url }}',
    '50renewal': '{{ "renewal50.png" | asset_url }}',
    '20silver': '{{ "silver20.png" | asset_url }}',
    '20gold': '{{ "gold20.png" | asset_url }}',
    'greentick': '{{ "greentick.png" | asset_url }}'
  };
</script>

{% assign stripped_tag = '' %}
{% assign member_label = '' %}
{% for tag in customer.tags %}
  {% if tag contains 'skechers_' %}
    {% assign stripped_tag = tag | remove: 'skechers_' %}
    {% if stripped_tag == 'Gold' %}
      {% assign member_label = 'Gold Member' %}
    {% elsif stripped_tag == 'Silver' %}
      {% assign member_label = 'Silver Member' %}
    {% elsif stripped_tag == 'PreMember' %}
      {% assign member_label = 'Pre-Member' %}
    {% else %}
      {% assign member_label = stripped_tag %}
    {% endif %}
    {% break %}
  {% endif %}
{% endfor %}

<script>
  const customerStrippedTag = "{{ stripped_tag }}";
</script>

<div class="container mt-4">
  <div class="greetings js-update" style="display: none;">
    <p class="hiuser">
      Welcome {{ customer.name }},<br>
    </p>
    <p>
      You are currently a <span id="tier-tag" style="color: #0070C0; font-weight: bold;">{{ member_label }}</span> and have
      <span id="points-value" style="color: #0070C0; font-weight: bold;">0</span> points expiring on
      <span id="points-expiry" style="color: #213168; font-weight: bold;">X X 2025</span><br>
      Your tier cycle is valid until <span id="cycle-end" style="color: #213168; font-weight: bold;">X X 2026</span>.
    </p>
    <div class="claim-points-container">
      <a href="https://members.skechers.com.my/Login" target="_blank" class="claim-points">
        Points Redemption
      </a>
    </div>
  </div>

  <div class="voucher-tabs">
    <div class="voucher-tabs__header">
      <div class="voucher-tabs__tab active" data-tab="active">Active</div>
      <div class="voucher-tabs__tab" data-tab="redeemed">Redeemed</div>
      <div class="voucher-tabs__tab" data-tab="expired">Expired</div>
    </div>

    <div class="voucher-tabs__content active" id="active-vouchers" style="display:none;">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div id="active-row"></div>
    </div>

    <div class="voucher-tabs__content" id="redeemed-vouchers">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div id="redeemed-row"></div>
    </div>

    <div class="voucher-tabs__content" id="expired-vouchers">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div id="expired-row"></div>
    </div>

    <div class="voucher-footer">
      <div class="faq-title1">Frequently Asked Question</div>
      <div class="faq-title2">How Skechers Membership Works</div>

      <div class="faq-container">
        <div class="faq-item">
          <button class="faq-question">How to apply for Skechers Membership?</button>
          <div class="faq-answer">
            <p>Online<br>You can sign up as a Skechers Pre-Member by creating an account on our official website at <a href="https://www.skechers.com.my/">www.skechers.com.my</a></p>
            <p>In-store:<br>Scan the QR code available at the cashier counter at any Skechers Concept Store, City Outlet, or Outlet to register as a Skechers Pre-Member.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">Where Can I Earn and Collect Points?</button>
          <div class="faq-answer">
            <p>Silver and Gold Members can earn points at all Skechers Concept Stores and Skechers Website excluding Skechers City Outlets, Skechers Outlet stores, Skechers Shop in Shop, Department stores, Skechers Temporary Pop-Up Stores and Skechers Fairs.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">How do I earn points from my purchase?</button>
          <div class="faq-answer">
            <p>Provide your registered mobile number at the point of purchase to verify your membership account. Once verified, our store staff will assist in crediting the points to your membership account.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">Can I enjoy my membership privileges at Skechers Outlets?</button>
          <div class="faq-answer">
            <p>Skechers Members may redeem and use Welcome Vouchers (RM30/RM50) and RM20 E-Vouchers (redeemed using points) at Skechers Outlets. However, points will not be earned on purchases made at Skechers Outlets.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">If I own more than 1 voucher, can I redeem them together?</button>
          <div class="faq-answer">
            <p>Please be informed that effective 3 July 2023, only one (1) Gift Voucher or Welcome Voucher may be used and redeemed per single receipt.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">Will my points expired?</button>
          <div class="faq-answer">
            <p>Yes. Points earned within the same calendar year will expire on 31 March of the following year.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">Where can the RM30/RM50 Welcome gift e-vouchers be used?</button>
          <div class="faq-answer">
            <p>Welcome Gift E-Vouchers (RM30/RM50) and RM20 E-Vouchers can be used as cash equivalent at all Skechers Concept Stores, City Outlets, and Outlets.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">What is the voucher validity date?</button>
          <div class="faq-answer">
            <p>For RM30/RM50 Welcome Vouchers, the voucher validity is 1 year. For RM20 E-Vouchers (redeemed using points), the voucher validity is the same day (until 11:59 PM).</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
// FAQ accordion
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", function () {
    const faqItem = this.parentElement;
    const answer = this.nextElementSibling;
    const isOpen = faqItem.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
      item.querySelector(".faq-answer").style.display = "none";
    });

    if (!isOpen) {
      faqItem.classList.add("active");
      answer.style.display = "block";
    }
  });
});

// Voucher functionality
const shopifyId = window.customerId;
let apiResponseData;

async function apiSync() {
  const requestData = { CountryCode: "MY", shopifyID: shopifyId };

  try {
    const [voucherRes, pointsRes] = await Promise.all([
      fetch(\`https://techzonite.skechers.com.my/api/skechers/getMYCRMVoucher?shopifyID=\${shopifyId}\`),
      fetch(\`https://techzonite.skechers.com.my/api/skechers/getPointDetails\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      }),
    ]);

    const [voucherData, pointsData] = await Promise.all([voucherRes.json(), pointsRes.json()]);

    const current = pointsData.find((p) => p.PointsType === "Current");
    if (current) {
      document.getElementById("points-value").textContent = parseInt(current.PointsBALValue);
      document.getElementById("points-expiry").textContent = formatDate(current.PointsExpiringDate);
      document.getElementById("cycle-end").textContent = formatDate(current.CycEndDate);
      document.querySelector(".js-update").style.display = "block";
    }

    return { ...voucherData, points: pointsData };
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDate2(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getPointsFromVoucher(voucher) {
  if (voucher.VoucherTypeCode === "20Silver" || voucher.VoucherTypeCode === "20Gold") {
    const match = voucher.VoucherTypeName.match(/(\\d+)pts/);
    return match ? match[1] : "180";
  }
  return "180";
}

if (window.customerId) {
  apiSync()
    .then((res) => {
      if (!res) throw new Error("No API response received");
      apiResponseData = res;

      let ActiveVouchers = apiResponseData.ActiveVoucherLists.map((voucher) => ({ voucherNumber: voucher.VoucherNo }));

      return fetch(\`https://techzonite.skechers.com.my/api/skechers/checkMYStoreVoucher\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ActiveVouchers),
      });
    })
    .then((response) => response.json())
    .then((data) => {
      if (!data || data.length === 0) {
        apiResponseData.ActiveVoucherLists.forEach((voucher) => { voucher.isRedeem = false; });
      } else {
        apiResponseData.ActiveVoucherLists.forEach((voucher) => {
          const match = data.find((apiVoucher) => apiVoucher.VoucherNumber === voucher.VoucherNo);
          voucher.isRedeem = match ? match.IsValid : false;
        });
      }
      showContent(apiResponseData);
    })
    .catch((error) => {
      console.error("Error:", error);
      document.querySelectorAll(".loading-spinner").forEach((spinner) => { spinner.style.display = "none"; });
    });
} else {
  document.querySelectorAll(".voucher-tabs__content").forEach((content) => {
    content.innerHTML = '<div class="no-vouchers">Please log in to view your vouchers</div>';
  });
}

function showContent(data) {
  const activeVouchers = Array.isArray(data?.ActiveVoucherLists) ? data.ActiveVoucherLists : [];
  const redeemedVouchers = Array.isArray(data?.RedeemedVoucherLists) ? data.RedeemedVoucherLists : [];
  const expiredVouchers = Array.isArray(data?.ExpiredVoucherLists) ? data.ExpiredVoucherLists : [];

  const createColumnLayout = (vouchers, status) => \`
    <div class="row">
      \${vouchers.map((v) => \`<div class="col-sm-12 col-md-6 col-lg-6 mb-4">\${generateVoucherRow({ ...v, status })}</div>\`).join("")}
    </div>
  \`;

  document.querySelector("#active-row").innerHTML = activeVouchers.length > 0 ? createColumnLayout(activeVouchers, "Active") : '<div class="no-vouchers">No active vouchers found</div>';
  document.querySelector("#redeemed-row").innerHTML = redeemedVouchers.length > 0 ? createColumnLayout(redeemedVouchers, "Redeemed") : '<div class="no-vouchers">No redeemed vouchers found</div>';
  document.querySelector("#expired-row").innerHTML = expiredVouchers.length > 0 ? createColumnLayout(expiredVouchers, "Expired") : '<div class="no-vouchers">No expired vouchers found</div>';
  document.querySelectorAll(".loading-spinner").forEach((spinner) => { spinner.style.display = "none"; });
}

function getVoucherImage(voucherNo) {
  if (!voucherNo) return "https://via.placeholder.com/150";
  const voucherLower = voucherNo.toLowerCase();
  const imageKey = Object.keys(window.voucherImageMap || {}).find((key) => voucherLower.includes(key.toLowerCase()));
  return imageKey ? window.voucherImageMap[imageKey] : "https://via.placeholder.com/150";
}

function generateVoucherRow(voucher) {
  if (!voucher) return "";
  const imageUrl = getVoucherImage(voucher.VoucherNo);
  let usageInfo = "";

  try {
    if (voucher.status === "Active" && voucher.ValidTo) {
      const endTimestamp = parseInt(voucher.ValidTo.match(/\\d+/)[0]);
      const endDate = new Date(endTimestamp);
      if (["Gold-50Renewal", "Silver-30Welcome", "Gold-50Welcome"].includes(voucher.VoucherTypeCode)) {
        usageInfo = \`Use before \${formatDate2(endDate)}\`;
      } else {
        usageInfo = \`Valid on \${formatDate2(endDate)}\`;
      }
    }
  } catch (e) { console.error("Error parsing date:", e); }

  let claimButton = "";
  let imageClass = "col-image col-5";

  if (voucher.status === "Active") {
    if (voucher.isRedeem === false) {
      claimButton = \`<button class="btn-claim" data-voucher="\${voucher.VoucherNo || ""}">ACTIVATE</button>\`;
    } else {
      claimButton = \`<button class="btn-claim copied-btn copy-btn" data-voucher="\${voucher.VoucherNo || ""}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5h5a.5.5 0 0 0 .5-.5v-1h1v1A1.5 1.5 0 0 1 10 14.5H5A2.5 2.5 0 0 1 2.5 12V4A2.5 2.5 0 0 1 5 1.5h5z"/>
          <path d="M12.5 4a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5h5.5zM7 3.5A1.5 1.5 0 0 0 5.5 5v7A1.5 1.5 0 0 0 7 13.5h5.5A1.5 1.5 0 0 0 14 12V5A1.5 1.5 0 0 0 12.5 3.5H7z"/>
        </svg> COPY CODE</button>\`;
    }
  } else if (voucher.status === "Redeemed") {
    claimButton = \`<button class="btn-redeemed" disabled>Redeemed</button>\`;
    imageClass += " redeemed";
  } else if (voucher.status === "Expired") {
    claimButton = \`<button class="btn-expired" disabled>Expired</button>\`;
    imageClass += " expired";
  }

  return \`
    <div class="voucher-card-container">
      <div class="voucher-card">
        <div class="row no-gutters h-100">
          <div class="\${imageClass}">
            <img src="\${imageUrl}" class="card-img" alt="Voucher Image">
          </div>
          <div class="col-divider col-1"><div class="dotted-divider"></div></div>
          <div class="col-details col-6">
            <div class="details-content">
              <p class="card-text">\${voucher.VoucherTypeName || "Voucher"}</p>
              <p class="card-title">\${voucher.VoucherNo || "N/A"}</p>
              <p class="usage-info">\${usageInfo}</p>
            </div>
            <div class="claim-button-container">\${claimButton}</div>
          </div>
        </div>
      </div>
    </div>
  \`;
}

// Tab switching
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".voucher-tabs__tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".voucher-tabs__tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".voucher-tabs__content").forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId + "-vouchers").classList.add("active");
    });
  });
});

// Claim button handler
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-claim") && !e.target.classList.contains("copied-btn")) {
    const voucherNo = e.target.getAttribute("data-voucher");
    if (confirm("Are you sure you want to redeem voucher number " + voucherNo + "?")) {
      const voucher = apiResponseData.ActiveVoucherLists.find((v) => v.VoucherNo === voucherNo);
      if (!voucher) { alert("Voucher not found"); return; }

      const btn = e.target;
      btn.textContent = "Processing...";
      btn.disabled = true;

      fetch(\`https://techzonite.skechers.com.my/api/skechers/activateMYStoreVoucher?shopifyID=\${shopifyId}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucher),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data === true) {
            btn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z"/></svg> CODE COPIED\`;
            btn.classList.add("copied-btn");
            btn.disabled = false;
            navigator.clipboard.writeText(voucherNo).then(() => alert("Voucher code copied!"));
          } else {
            throw new Error("Redeem failed");
          }
        })
        .catch((error) => {
          alert("Failed to redeem voucher: " + error.message);
          btn.textContent = "ACTIVATE";
          btn.disabled = false;
        });
    }
  }

  // Copy code button
  if (e.target.classList.contains("copied-btn")) {
    const voucherCode = e.target.getAttribute("data-voucher");
    navigator.clipboard.writeText(voucherCode).then(() => alert("Voucher code copied!"));
  }
});
</script>
`;

  return liquid(liquidTemplate);
};
