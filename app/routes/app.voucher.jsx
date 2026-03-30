import { useEffect, useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Fetch settings
  const response = await fetch(`${process.env.SHOPIFY_APP_URL || ""}/api/settings`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return {
      settings: {
        showVoucherSection: true,
      },
    };
  }

  const data = await response.json();
  return data;
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  if (request.method === "POST") {
    const formData = await request.formData();
    const showVoucherSection = formData.get("showVoucherSection") === "true";

    const response = await fetch(`${process.env.SHOPIFY_APP_URL || ""}/api/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ showVoucherSection }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to update settings",
      };
    }

    return await response.json();
  }

  return null;
};

export default function VoucherPage() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();
  const [showVoucherSection, setShowVoucherSection] = useState(settings.showVoucherSection);

  const handleToggle = (value) => {
    setShowVoucherSection(value);
    fetcher.submit(
      { showVoucherSection: value },
      { method: "POST", action: "/app/voucher" }
    );
  };

  return (
    <s-page heading="Voucher Management">
      <s-section heading="Voucher Page">
        <s-paragraph>
          This is the voucher page where you can manage your vouchers.
        </s-paragraph>
        <s-paragraph>
          Your existing liquid, CSS, and JS files are located in the app/voucher-assets directory.
        </s-paragraph>
      </s-section>

      <s-section heading="Profile Section Settings">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Control whether the voucher section appears on the customer profile page.
          </s-paragraph>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="inline" gap="base" alignment="center">
              <s-text>Show Voucher Section:</s-text>
              <s-button
                onClick={() => handleToggle(!showVoucherSection)}
                variant={showVoucherSection ? "primary" : "secondary"}
              >
                {showVoucherSection ? "ON" : "OFF"}
              </s-button>
            </s-stack>
          </s-box>
          {fetcher.data?.success === false && (
            <s-text appearance="critical">Failed to update settings</s-text>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Voucher Preview">
        <s-paragraph>
          To see the voucher page with your liquid template, you can access it via the theme extension.
        </s-paragraph>
        <s-paragraph>
          The voucher assets are ready to be integrated with the customer account section.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Features">
        <s-unordered-list>
          <s-list-item>Create and manage vouchers</s-list-item>
          <s-list-item>Configure voucher settings</s-list-item>
          <s-list-item>Toggle profile section visibility</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Assets Location">
        <s-unordered-list>
          <s-list-item>Liquid: app/voucher-assets/template.liquid</s-list-item>
          <s-list-item>CSS: app/voucher-assets/styles.css</s-list-item>
          <s-list-item>JS: app/voucher-assets/script.js</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}