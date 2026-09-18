const nodemailer = require('nodemailer');

/**
 * Creates and returns a configured Nodemailer transporter using SMTP credentials from .env
 */
const createTransporter = () => {
  const safeHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const safePort = parseInt(process.env.SMTP_PORT, 10) || 587;
  const cleanPass = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  if (safeHost.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: cleanPass
      }
    });
  }

  return nodemailer.createTransport({
    host: safeHost,
    port: safePort,
    secure: safePort === 465,
    requireTLS: safePort === 587,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: cleanPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });
};

/**
 * Clean from email for strict envelope compliance
 */
const getCleanFromEmail = () => {
  const rawFrom = (process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || '').trim();
  const emailMatch = rawFrom.match(/<([^>]+)>/);
  return emailMatch ? emailMatch[1].trim() : rawFrom.replace(/["']/g, '').trim();
};

/**
 * Generates rich HTML email template for VÆROX purchase receipt
 */
const generateInvoiceHtml = (order) => {
  const { id, paymentId, date, user, items, subtotal: rawSubtotal, tax: rawTax, totalAmount: rawTotalAmount } = order;
  const formattedDate = date ? new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Compute exact financial numbers
  let calculatedSubtotal = 0;
  const itemsHtml = (items || []).map((item) => {
    const itemPrice = Number(item.price || 0);
    const itemQty = Number(item.quantity || 1);
    const itemTotal = itemPrice * itemQty;
    calculatedSubtotal += itemTotal;

    const sizeBadge = item.size ? `<span style="display: inline-block; background: #1C1A14; color: #C9A84C; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid #C9A84C; text-transform: uppercase; font-family: 'Bodoni Moda', Georgia, serif;">SIZE: ${item.size}</span>` : '';
    
    let customFit = '';
    if (item.customMeasurements) {
      const m = item.customMeasurements;
      customFit = `
        <div style="margin-top: 6px; font-size: 11px; color: #D4B559; background: #121212; padding: 6px 10px; border-radius: 6px; border-left: 2px solid #C9A84C; font-family: 'Bodoni Moda', Georgia, serif;">
          <strong>Bespoke Custom Measurements:</strong> Chest ${m.chest || '-'}", Waist ${m.waist || '-'}", Hips ${m.hips || '-'}", Torso ${m.torso || '-'} (${m.fitPreference || 'Tailored'})
        </div>
      `;
    }

    return `
      <tr style="border-bottom: 1px solid #24221C;">
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="font-weight: 700; font-size: 15px; color: #FFF5D6; font-family: 'Bodoni Moda', Georgia, serif; line-height: 1.3;">${item.name || 'VÆROX Executive Collection Product'}</div>
          <div style="margin-top: 6px;">${sizeBadge}</div>
          ${customFit}
        </td>
        <td style="padding: 16px 8px; color: #A39E93; text-align: center; font-size: 14px; vertical-align: top; font-weight: 600; font-family: 'Bodoni Moda', Georgia, serif;">x${itemQty}</td>
        <td style="padding: 16px 8px; color: #AAA; text-align: right; font-size: 14px; vertical-align: top; font-weight: 600; font-family: 'Bodoni Moda', Georgia, serif;">₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 16px 8px; color: #C9A84C; text-align: right; font-weight: 700; font-size: 15px; vertical-align: top; font-family: 'Bodoni Moda', Georgia, serif;">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  const finalSubtotal = rawSubtotal != null && !isNaN(rawSubtotal) ? Number(rawSubtotal) : calculatedSubtotal;
  const finalTax = rawTax != null && !isNaN(rawTax) ? Number(rawTax) : 0;
  const finalTotalAmount = rawTotalAmount != null && !isNaN(rawTotalAmount) ? Number(rawTotalAmount) : Number((finalSubtotal + finalTax).toFixed(2));

  // Delivery Address formatting
  const userAddr = user?.address ? user.address.trim() : '';
  const userCity = user?.city ? user.city.trim() : '';
  const userState = user?.state ? user.state.trim() : '';
  const userZip = user?.zipCode ? user.zipCode.trim() : '';

  let formattedAddress = 'Baad Post - Kakua gwalior road agra, Agra, Uttar Pradesh - 282009';
  if (userAddr && userAddr.length > 3 && userAddr !== 'N/A' && !userAddr.includes('402 Regency')) {
    formattedAddress = `${userAddr}${userCity ? `, ${userCity}` : ''}${userState ? `, ${userState}` : ''} - ${userZip || '282009'}`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Order — VÆROX</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&display=swap" rel="stylesheet">
    </head>
    <body style="background-color: #000000; color: #E8E0CC; font-family: 'Bodoni Moda', Georgia, 'Times New Roman', serif; margin: 0; padding: 20px 10px;">
      <div style="max-width: 620px; margin: 0 auto; background: #0A0A0A; border: 1.5px solid #C9A84C; border-radius: 24px; overflow: hidden; box-shadow: 0 0 50px rgba(201, 168, 76, 0.25); font-family: 'Bodoni Moda', Georgia, serif;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(180deg, #181611 0%, #0A0A0A 100%); padding: 36px 24px 24px 24px; text-align: center; border-bottom: 1px solid #26241E;">
          <h1 style="color: #C9A84C; font-family: 'Bodoni Moda', Georgia, serif; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 800;">VÆROX SMART LIVING</h1>
          <p style="color: #A39E93; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 8px 0 0 0; font-weight: 600; font-family: 'Bodoni Moda', Georgia, serif;">Premier Atelier & Luxury Collection</p>
        </div>

        <!-- Thank You Banner -->
        <div style="background: linear-gradient(90deg, #1C1608 0%, #0F0D08 100%); border-bottom: 1px solid #332B16; padding: 22px 24px; text-align: center;">
          <h2 style="color: #FFF5D6; font-family: 'Bodoni Moda', Georgia, serif; margin: 0; font-size: 18px; font-weight: 700;">🎉 Thank You for Shopping with VÆROX!</h2>
          <p style="color: #D4B559; font-size: 13px; margin: 8px 0 0 0; font-weight: 500; font-family: 'Bodoni Moda', Georgia, serif;">Your order has been placed successfully and will be delivered within 10-12 days.</p>
        </div>

        <!-- Order & Payment Info Summary -->
        <div style="padding: 20px 24px; background: #0D0D0D; border-bottom: 1px solid #222;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'Bodoni Moda', Georgia, serif;">
            <tr>
              <td style="padding: 6px 0; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">Order Reference:</td>
              <td style="padding: 6px 0; color: #FFF5D6; text-align: right; font-weight: bold; font-family: 'Bodoni Moda', Georgia, serif; font-size: 14px;">${id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">Razorpay Payment ID:</td>
              <td style="padding: 6px 0; color: #4ADE80; text-align: right; font-weight: bold; font-family: 'Bodoni Moda', Georgia, serif; font-size: 13px;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">Payment Status:</td>
              <td style="padding: 6px 0; color: #4ADE80; text-align: right; font-weight: bold; font-family: 'Bodoni Moda', Georgia, serif;">✔ PAID (Online)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">Date & Time:</td>
              <td style="padding: 6px 0; color: #CCC; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <!-- Customer & Delivery Address -->
        <div style="padding: 24px; border-bottom: 1px solid #222; background: #0A0A0A; font-family: 'Bodoni Moda', Georgia, serif;">
          <h3 style="color: #C9A84C; font-size: 12px; font-family: 'Bodoni Moda', Georgia, serif; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; border-bottom: 1px solid #26241E; padding-bottom: 6px;">Shipping & Delivery Details</h3>
          <div style="font-size: 15px; color: #FFF; font-weight: 700; font-family: 'Bodoni Moda', Georgia, serif;">${user?.name || 'Sarthak Bhatnagar'}</div>
          <div style="font-size: 13px; color: #4ADE80; font-family: 'Bodoni Moda', Georgia, serif; margin-top: 4px;">${user?.email || ''}</div>
          <div style="font-size: 13px; color: #AAA; margin-top: 2px; font-family: 'Bodoni Moda', Georgia, serif;">Phone: ${user?.phone || 'N/A'}</div>
          <div style="font-size: 13px; color: #CCC; margin-top: 10px; line-height: 1.5; background: #121212; padding: 14px; border-radius: 10px; border: 1px solid #222; font-family: 'Bodoni Moda', Georgia, serif;">
            📍 <strong>Delivery Address:</strong><br/>
            ${formattedAddress}
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #D4B559; font-family: 'Bodoni Moda', Georgia, serif;">
            🚚 <strong>Delivery Timeline:</strong> Order will be placed within 10-12 days.
          </div>
        </div>

        <!-- Purchased Items Table -->
        <div style="padding: 24px 20px; font-family: 'Bodoni Moda', Georgia, serif;">
          <h3 style="color: #C9A84C; font-size: 12px; font-family: 'Bodoni Moda', Georgia, serif; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; border-bottom: 1px solid #26241E; padding-bottom: 6px;">Item Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-family: 'Bodoni Moda', Georgia, serif;">
            <thead>
              <tr style="border-bottom: 1px solid #333; text-align: left; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">
                <th style="padding: 8px; font-family: 'Bodoni Moda', Georgia, serif;">Product Details</th>
                <th style="padding: 8px; text-align: center; font-family: 'Bodoni Moda', Georgia, serif;">Qty</th>
                <th style="padding: 8px; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">Unit Price</th>
                <th style="padding: 8px; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Billing Breakdown -->
        <div style="padding: 20px 24px; background: #0D0D0D; border-top: 1px solid #222; font-family: 'Bodoni Moda', Georgia, serif;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'Bodoni Moda', Georgia, serif;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-family: 'Bodoni Moda', Georgia, serif;">Subtotal:</td>
              <td style="padding: 6px 0; color: #CCC; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">₹${finalSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ${finalTax > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #888; font-family: 'Bodoni Moda', Georgia, serif;">Estimated Tax:</td>
              <td style="padding: 6px 0; color: #CCC; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">₹${finalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ` : `
            <tr>
              <td style="padding: 6px 0; color: #888; font-family: 'Bodoni Moda', Georgia, serif;">Estimated Tax:</td>
              <td style="padding: 6px 0; color: #4ADE80; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">Included</td>
            </tr>
            `}
            <tr>
              <td style="padding: 6px 0; color: #888; font-family: 'Bodoni Moda', Georgia, serif;">Shipping Charge:</td>
              <td style="padding: 6px 0; color: #4ADE80; text-align: right; font-weight: bold; font-family: 'Bodoni Moda', Georgia, serif;">FREE (Delivery within 10-12 days)</td>
            </tr>
            <tr style="border-top: 1.5px solid #333;">
              <td style="padding: 12px 0 0 0; color: #FFF; font-weight: 800; font-size: 16px; font-family: 'Bodoni Moda', Georgia, serif;">Total Amount Paid:</td>
              <td style="padding: 12px 0 0 0; color: #C9A84C; font-weight: 800; font-size: 20px; text-align: right; font-family: 'Bodoni Moda', Georgia, serif;">₹${finalTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <!-- Footer Call to Action & Support -->
        <div style="background: #050505; padding: 28px 24px; text-align: center; border-top: 1px solid #26241E; font-family: 'Bodoni Moda', Georgia, serif;">
          <p style="color: #FFF5D6; font-size: 13px; margin: 0; font-weight: 600; font-family: 'Bodoni Moda', Georgia, serif;">We are crafting your luxury order with utmost precision.</p>
          <p style="color: #888; font-size: 11px; margin: 8px 0 16px 0; line-height: 1.4; font-family: 'Bodoni Moda', Georgia, serif;">Your order will be delivered within 10-12 days. If you have any questions, feel free to reply directly to this email.</p>
          <div style="border-top: 1px solid #1A1A1A; padding-top: 16px; margin-top: 16px;">
            <p style="color: #555; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-family: 'Bodoni Moda', Georgia, serif;">© ${new Date().getFullYear()} VÆROX Smart Living. All rights reserved.</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};

/**
 * Sends order invoice email to the recipient customer email address
 */
const sendInvoiceEmail = async (orderData) => {
  try {
    const recipientEmail = orderData?.user?.email;
    if (!recipientEmail) {
      console.warn('[INVOICE EMAIL] No recipient email specified in orderData.');
      return { success: false, error: 'Recipient email missing' };
    }

    const cleanFrom = getCleanFromEmail();
    const htmlContent = generateInvoiceHtml(orderData);

    const mailOptions = {
      from: `"VÆROX Smart Living" <${cleanFrom}>`,
      sender: cleanFrom,
      replyTo: cleanFrom,
      envelope: {
        from: cleanFrom,
        to: [recipientEmail]
      },
      to: recipientEmail,
      subject: `🎉 Thank You for Your Order — VÆROX Smart Living (${orderData.id || 'VRX-ORDER'})`,
      html: htmlContent
    };

    // Primary attempt using configured SMTP
    const transporter = createTransporter();
    try {
      await transporter.verify();
      const info = await transporter.sendMail(mailOptions);
      console.log(`[INVOICE EMAIL SENT SUCCESS] Delivered invoice for Order ${orderData.id} to ${recipientEmail}`);
      console.log(`[MESSAGE ID]: ${info.messageId || info.id || 'ACCEPTED'}`);
      return { success: true, messageId: info.messageId };
    } catch (primaryErr) {
      console.warn(`[PRIMARY SMTP FAILED] ${primaryErr.message}. Attempting Gmail fallback...`);

      // Fallback: If user has configured Gmail App Password in SMTP_PASSWORD
      if (process.env.SMTP_PASSWORD && process.env.SMTP_EMAIL) {
        try {
          const gmailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_EMAIL,
              pass: process.env.SMTP_PASSWORD
            }
          });
          const info = await gmailTransporter.sendMail(mailOptions);
          console.log(`[GMAIL SMTP SENT SUCCESS] Delivered invoice for Order ${orderData.id} to ${recipientEmail}`);
          return { success: true, messageId: info.messageId };
        } catch (gmailErr) {
          console.warn(`[GMAIL SMTP FALLBACK FAILED] ${gmailErr.message}`);
        }
      }

      return { 
        success: false, 
        error: primaryErr.message,
        note: 'SMTP provider requires domain verification or Gmail App Password.' 
      };
    }
  } catch (err) {
    console.error(`[INVOICE EMAIL FAILED] Error processing invoice for ${orderData?.user?.email}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendInvoiceEmail,
  createTransporter
};
