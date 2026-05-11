const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// ========== ALL EMAIL FUNCTIONS ==========

// 1. LOGIN NOTIFICATION
exports.sendLoginNotification = functions.https.onCall(async (data, context) => {
  try {
    const { email, name, ipAddress, deviceInfo } = data;
    
    const mailOptions = {
      from: `"Your Store" <${gmailEmail}>`,
      to: email,
      subject: '🔐 New Login Detected on Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Login Notification</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${name || 'User'},</h2>
            <p>A new login was detected on your account:</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Login Details:</strong></p>
              <p>📅 <strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p>📍 <strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
              <p>📱 <strong>Device:</strong> ${deviceInfo || 'Unknown device'}</p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>If this wasn't you, please secure your account immediately:</p>
              <ol>
                <li>Change your password</li>
                <li>Enable two-factor authentication</li>
                <li>Contact our support team</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/security" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Account Security
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Login notification error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 2. PASSWORD RESET EMAIL
exports.sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, name } = data;
    
    const mailOptions = {
      from: `"Your Store Support" <${gmailEmail}>`,
      to: email,
      subject: '🔑 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Password Reset</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${name || 'User'},</h2>
            <p>We received a request to reset your password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/reset-password" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Important:</strong></p>
              <ul>
                <li>Use the link above to reset your password</li>
                <li>If you didn't request this, ignore this email</li>
                <li>Your password will not change until you complete the reset process</li>
              </ul>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 3. RETURN ORDER EMAIL
exports.sendReturnOrderEmail = functions.https.onCall(async (data, context) => {
  try {
    const { customerEmail, customerName, returnData } = data;
    
    const itemsHtml = returnData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Your Store Returns" <${gmailEmail}>`,
      to: customerEmail,
      subject: `📦 Return Request Received - ${returnData.returnId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Return Request Confirmation</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${customerName},</h2>
            <p>Your return request has been received and is being processed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Return Details:</strong></p>
              <p>📦 <strong>Return ID:</strong> ${returnData.returnId}</p>
              <p>📝 <strong>Order ID:</strong> ${returnData.orderId}</p>
              <p>📅 <strong>Request Date:</strong> ${new Date(returnData.requestedAt).toLocaleString()}</p>
              <p>📋 <strong>Reason:</strong> ${returnData.reason}</p>
              <span style="background: #ffc107; color: #856404; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${returnData.status}
              </span>
            </div>
            
            <h3>Items for Return:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: left;">Quantity</th>
                  <th style="padding: 12px; text-align: left;">Price</th>
                  <th style="padding: 12px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Refund Amount:</td>
                  <td style="padding: 10px; font-weight: bold;">₹${returnData.refundAmount}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📦 Return Instructions:</h4>
              <ol>
                <li>Keep items in original packaging</li>
                <li>Include all accessories and tags</li>
                <li>Our pickup executive will contact you within 24 hours</li>
                <li>Refund will be processed within 5-7 business days after inspection</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/track-return?id=${returnData.returnId}" style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Return Status
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Return order email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 4. CANCEL ORDER EMAIL
exports.sendCancelOrderEmail = functions.https.onCall(async (data, context) => {
  try {
    const { customerEmail, customerName, cancelData } = data;
    
    const itemsHtml = cancelData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Your Store Orders" <${gmailEmail}>`,
      to: customerEmail,
      subject: `❌ Order Cancelled - ${cancelData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Order Cancellation Confirmation</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${customerName},</h2>
            <p>Your order cancellation has been processed successfully.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Cancellation Details:</strong></p>
              <p>❌ <strong>Order ID:</strong> ${cancelData.orderId}</p>
              <p>📅 <strong>Cancellation Date:</strong> ${new Date(cancelData.cancelledAt).toLocaleString()}</p>
              <p>📋 <strong>Reason:</strong> ${cancelData.reason}</p>
              <span style="background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                Cancelled
              </span>
            </div>
            
            <h3>Cancelled Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: left;">Quantity</th>
                  <th style="padding: 12px; text-align: left;">Price</th>
                  <th style="padding: 12px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Refund Amount:</td>
                  <td style="padding: 10px; font-weight: bold;">₹${cancelData.refundAmount}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>💰 Refund Information:</h4>
              <p><strong>Payment Method:</strong> ${cancelData.paymentMethod}</p>
              <p><strong>Refund Status:</strong> <span style="background: #17a2b8; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Processing</span></p>
              <p><strong>Estimated Refund Time:</strong> ${cancelData.paymentMethod === 'cod' ? 'Not applicable' : '5-7 business days'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/my-orders" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Updated Orders
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Cancel order email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 5. COD ORDER EMAIL
exports.sendCODOrderEmail = functions.https.onCall(async (data, context) => {
  try {
    const { orderData } = data;
    
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" width="50" style="border-radius: 5px;">` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Your Store Orders" <${gmailEmail}>`,
      to: orderData.customerInfo.email,
      subject: `📦 Cash on Delivery Order Confirmed - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>COD Order Confirmation</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${orderData.customerInfo.name},</h2>
            <p>Thank you for your order! Your payment will be collected at the time of delivery.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order Details:</strong></p>
              <p>📦 <strong>Order ID:</strong> ${orderData.orderId}</p>
              <p>💰 <strong>Payment Method:</strong> Cash on Delivery</p>
              <p>📅 <strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
              <p>📋 <strong>Order Status:</strong> <span style="background: #ffc107; color: #856404; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">${orderData.status}</span></p>
            </div>
            
            <h3>Order Summary:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Image</th>
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: left;">Quantity</th>
                  <th style="padding: 12px; text-align: left;">Price</th>
                  <th style="padding: 12px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 10px; font-weight: bold;">₹${orderData.amount}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📋 Cash on Delivery Instructions:</h4>
              <ul>
                <li>Keep exact cash ready for the delivery executive</li>
                <li>You can pay using UPI/PhonePe/Google Pay to the delivery executive</li>
                <li>Inspect the package before making payment</li>
                <li>Get a receipt from the delivery executive</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Shipping Address:</h4>
              <p>
                ${orderData.customerInfo.name}<br>
                ${orderData.customerInfo.address}<br>
                ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}<br>
                📱 ${orderData.customerInfo.phone}<br>
                📧 ${orderData.customerInfo.email}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/track-order?id=${orderData.orderId}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('COD order email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 6. UPI PAYMENT EMAIL
exports.sendUPIPaymentEmail = functions.https.onCall(async (data, context) => {
  try {
    const { paymentData } = data;
    
    const mailOptions = {
      from: `"Your Store Payments" <${gmailEmail}>`,
      to: paymentData.customerEmail,
      subject: `✅ UPI Payment Successful - ${paymentData.paymentId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>UPI Payment Confirmation</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${paymentData.customerName},</h2>
            <p>Your UPI payment has been processed successfully.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Payment Details:</strong></p>
              <p>💳 <strong>Payment ID:</strong> ${paymentData.paymentId}</p>
              <p>💰 <strong>Amount:</strong> ₹${paymentData.amount}</p>
              <p>📅 <strong>Payment Date:</strong> ${new Date(paymentData.paidAt).toLocaleString()}</p>
              <p>📋 <strong>UPI Transaction ID:</strong> ${paymentData.upiTransactionId}</p>
              <p>🏦 <strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
              <span style="background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                Paid
              </span>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📦 Order Information:</h4>
              <p><strong>Order ID:</strong> ${paymentData.orderId}</p>
              ${paymentData.items ? `<p><strong>Items:</strong> ${paymentData.items.map(item => item.name).join(', ')}</p>` : ''}
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📋 What's Next?</h4>
              <ol>
                <li>Your order is now being processed</li>
                <li>You will receive shipping confirmation within 24 hours</li>
                <li>Track your order from your account</li>
                <li>Save this email for your records</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/invoice/${paymentData.orderId}" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Download Invoice
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('UPI payment email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 7. ORDER CONFIRMATION EMAIL (GENERAL)
exports.sendOrderConfirmationEmail = functions.https.onCall(async (data, context) => {
  try {
    const { orderData } = data;
    
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" width="50" style="border-radius: 5px;">` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Your Store Orders" <${gmailEmail}>`,
      to: orderData.customerInfo.email,
      subject: `🎉 Order Confirmed - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Order Confirmation</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>Hi ${orderData.customerInfo.name},</h2>
            <p>Thank you for shopping with us! Your order has been confirmed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order Details:</strong></p>
              <p>📦 <strong>Order ID:</strong> ${orderData.orderId}</p>
              <p>💰 <strong>Total Amount:</strong> ₹${orderData.amount}</p>
              <p>💳 <strong>Payment Method:</strong> ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p>📅 <strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
              <span style="background: #17a2b8; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${orderData.status}
              </span>
            </div>
            
            <h3>Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Image</th>
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: left;">Quantity</th>
                  <th style="padding: 12px; text-align: left;">Price</th>
                  <th style="padding: 12px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 10px; font-weight: bold;">₹${orderData.amount}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Shipping Address:</h4>
              <p>
                ${orderData.customerInfo.name}<br>
                ${orderData.customerInfo.address}<br>
                ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}<br>
                📱 ${orderData.customerInfo.phone}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourstore.com/my-orders" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Your Orders
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Order confirmation email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});