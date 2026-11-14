import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, amount, orderId, paymentId, signature, instituteId } = body;

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (action === "create-order") {
      // In development or when keys not supplied, return sandbox order id
      const order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: Math.round(Number(amount) * 100), // in paise
        currency: "INR",
        receipt: `rcpt_${instituteId}_${Date.now()}`,
      };
      return NextResponse.json({ success: true, order });
    }

    if (action === "verify-payment") {
      if (!razorpayKeySecret) {
        // Dev sandbox verification
        return NextResponse.json({ success: true, verified: true, paymentId });
      }

      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature === signature) {
        return NextResponse.json({ success: true, verified: true, paymentId });
      } else {
        return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
