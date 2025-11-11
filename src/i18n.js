import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      brandName: 'Pavanputra Mega Mart',
      tagline: 'Tamara Vyapar no Sacho Sathi',
      searchPlaceholder: 'Search for products...',
      categories: 'Categories',
      cart: 'Cart',
      checkout: 'Checkout',
      home: 'Home',
      orders: 'Orders',
      addToCart: 'Add to Cart',
      continueShop: 'Continue Shopping',
      placeOrder: 'Place Order',
      shopDetails: 'Shop Details',
      shopName: 'Shop Name',
      ownerName: 'Owner Name',
      mobile: 'Mobile Number',
      address: 'Address',
      pincode: 'Pincode',
      location: 'Location',
      selectLocation: 'Select Location on Map',
      invoice: 'Invoice',
      print: 'Print',
      download: 'Download PDF',
      qty: 'Qty',
      total: 'Total',
      discount: 'Discount',
      admin: 'Admin',
      delivery: 'Delivery',
      login: 'Login',
      username: 'Username',
      password: 'Password',
      nextDayDelivery: 'Next Day Delivery',
      sameDayDelivery: 'Same Day Delivery',
      deliveryOption: 'Delivery Option',
      price: 'Price',
      items: 'Items',
      orderPlaced: 'Order Placed Successfully',
      viewCart: 'View Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      add: 'ADD'
    }
  },
  gu: {
    translation: {
      brandName: 'પવનપુત્ર મેગા માર્ટ',
      tagline: 'તમારા વ્યાપાર નો સાચો સાથી',
      searchPlaceholder: 'ઉત્પાદનો શોધો...',
      categories: 'કેટેગરી',
      cart: 'કાર્ટ',
      checkout: 'ચેકઆઉટ',
      home: 'હોમ',
      orders: 'ઓર્ડર',
      addToCart: 'કાર્ટમાં ઉમેરો',
      continueShop: 'ખરીદી ચાલુ રાખો',
      placeOrder: 'ઓર્ડર કરો',
      shopDetails: 'દુકાનની વિગતો',
      shopName: 'દુકાનનું નામ',
      ownerName: 'માલિકનું નામ',
      mobile: 'મોબાઈલ નંબર',
      address: 'સરનામું',
      pincode: 'પિનકોડ',
      location: 'સ્થાન',
      selectLocation: 'નકશા પર સ્થાન પસંદ કરો',
      invoice: 'ઇન્વોઇસ',
      print: 'પ્રિન્ટ',
      download: 'ડાઉનલોડ PDF',
      qty: 'જથ્થો',
      total: 'કુલ',
      discount: 'ડિસ્કાઉન્ટ',
      admin: 'એડમિન',
      delivery: 'ડિલિવરી',
      login: 'લોગિન',
      username: 'યુઝરનેમ',
      password: 'પાસવર્ડ',
      nextDayDelivery: 'આવતી કાલે ડિલિવરી',
      sameDayDelivery: 'આજે જ ડિલિવરી',
      deliveryOption: 'ડિલિવરી વિકલ્પ',
      price: 'કિંમત',
      items: 'વસ્તુઓ',
      orderPlaced: 'ઓર્ડર સફળતાપૂર્વક મૂકાયો',
      viewCart: 'કાર્ટ જુઓ',
      inStock: 'સ્ટોકમાં છે',
      outOfStock: 'સ્ટોકમાં નથી',
      add: 'ઉમેરો'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;