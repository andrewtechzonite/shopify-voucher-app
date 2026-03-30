import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  return {
    settings: settings || {
      showVoucherSection: true,
    },
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  if (request.method === "POST") {
    const body = await request.json();
    const { showVoucherSection } = body;

    const settings = await prisma.appSettings.upsert({
      where: { shop: session.shop },
      update: {
        showVoucherSection: showVoucherSection !== undefined ? showVoucherSection : true,
        updatedAt: new Date(),
      },
      create: {
        shop: session.shop,
        showVoucherSection: showVoucherSection !== undefined ? showVoucherSection : true,
      },
    });

    return {
      success: true,
      settings,
    };
  }

  return { method: request.method };
};