// Gujarati translations for invoice
export const gujaratiInvoiceLabels = {
  invoice: "ઇન્વૉઇસ",
  company: "પવનપુત્ર મેગા માર્ટ",
  tagline: "તમારા વ્યાપાર નો સાચો સાથી",
  orderId: "ઓર્ડર નંબર",
  date: "તારીખ",
  customerDetails: "ગ્રાહક વિગતો",
  shopName: "દુકાનનું નામ",
  ownerName: "માલિકનું નામ",
  mobile: "મોબાઇલ",
  address: "સરનામું",
  pincode: "પિનકોડ",
  items: "વસ્તુઓ",
  item: "વસ્તુ",
  quantity: "જથ્થો",
  unit: "એકમ",
  price: "કિંમત",
  discount: "છૂટ",
  total: "કુલ",
  totalAmount: "કુલ રકમ",
  thankYou: "આભાર! ફરીથી આવજો!",
  
  // Units in Gujarati
  kg: "કિલો",
  gram: "ગ્રામ",
  piece: "પીસ",
  box: "બોક્સ",
  liter: "લિટર",
  
  // Status
  pending: "બાકી",
  packed: "પેક કર્યું",
  outForDelivery: "ડિલિવરી માટે",
  delivered: "પહોંચાડ્યું"
};

export const getGujaratiUnit = (unit) => {
  const unitMap = {
    'Kg': 'કિલો',
    'Gram': 'ગ્રામ', 
    'Piece': 'પીસ',
    'Box': 'બોક્સ',
    'Liter': 'લિટર'
  };
  return unitMap[unit] || unit;
};
