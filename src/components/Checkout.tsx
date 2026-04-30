import React, { useState } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Wallet, MapPin, User, Phone, Users, MessageSquare, Truck, CreditCard, ShoppingBag } from 'lucide-react';
import { CartItem, ServiceType } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { siteSettings } = useSiteSettings();
  const { paymentMethods } = usePaymentMethods();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [address, setAddress] = useState('');
  const [landmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const timeInfo = serviceType === 'pickup' 
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';
    
    
    const deliveryInfo = serviceType === 'delivery'
      ? `\nDelivery Method: Standard`
      : '';
    
    const orderDetails = `
${(siteSettings?.site_name || 'QualiFuel').toUpperCase()} ORDER

Customer: ${customerName}
Contact: ${contactNumber}
Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `Address: ${address}${landmark ? `\nLandmark: ${landmark}` : ''}${deliveryInfo}` : ''}
${serviceType === 'pickup' ? `Pickup Time: ${timeInfo}` : ''}
${serviceType === 'dine-in' ? `Party Size: ${partySize} person${partySize !== 1 ? 's' : ''}` : ''}

ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `- ${item.name}`;
  if (item.selectedVariations && item.selectedVariations.length > 0) {
    itemDetails += ` (${item.selectedVariations.map(v => v.name).join(' + ')})`;
  } else if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

TOTAL: ₱${totalPrice}

Payment Method: ${paymentMethods.filter(p => p.active)[0]?.name || 'GCash'}

${notes ? `Notes: ${notes}` : ''}

Thank you for choosing ${siteSettings?.site_name || 'QualiFuel'}!
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/qualifuelph?text=${encodedMessage}`;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = messengerUrl;
    } else {
      window.open(messengerUrl, '_blank');
    }
  };

  const isDetailsValid = customerName && contactNumber && 
    (serviceType !== 'delivery' || address) && 
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime)) &&
    (serviceType !== 'dine-in' || partySize > 0);

  const activePayments = paymentMethods.filter(p => p.active);

  if (step === 'details') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-24 animate-fade-in text-pretendard">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 md:mb-16 gap-8">
           <div className="flex items-center space-x-6 w-full lg:w-auto">
              <button
                title="Back"
                onClick={onBack}
                className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/10 group"
              >
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1 uppercase leading-none font-pretendard">
                  <span className="text-white">Order </span>
                  <span className="text-quali-primary">Checkout</span>
                </h1>
                <p className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-[0.4em]">Step 1: Contact & Delivery</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-3 md:space-x-4 bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-white/10 w-full lg:w-auto justify-center md:justify-start">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-quali-primary shadow-[0_0_10px_rgba(154,202,60,0.8)]" />
                <span className="text-[9px] md:text-[10px] font-black text-white tracking-widest">Details</span>
              </div>
              <div className="h-[1px] w-6 md:w-8 bg-white/10" />
              <div className="flex items-center space-x-2 opacity-30">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-[9px] md:text-[10px] font-black text-white tracking-widest">Payment</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Form */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
               <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase mb-8 md:mb-10 flex items-center">
                  <div className="w-1 h-5 md:h-6 bg-quali-primary mr-3 md:mr-4 rounded-full" />
                  Your Information
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                       <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm md:text-base font-bold italic uppercase"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4">Mobile Number</label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                       <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm md:text-base font-bold tracking-widest"
                        placeholder="09170000000"
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white/10 shadow-2xl">
               <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase mb-8 md:mb-10 flex items-center">
                  <div className="w-1 h-5 md:h-6 bg-quali-primary mr-3 md:mr-4 rounded-full" />
                  Service Type
               </h2>

               <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
                  {[
                    { value: 'dine-in', label: 'Dine In', icon: <Users className="h-6 w-6 md:h-8 md:w-8" /> },
                    { value: 'pickup', label: 'Pickup', icon: <ShoppingBag className="h-6 w-6 md:h-8 md:w-8" /> },
                    { value: 'delivery', label: 'Delivery', icon: <Truck className="h-6 w-6 md:h-8 md:w-8" /> }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`flex flex-col items-center justify-center p-4 md:p-8 rounded-xl md:rounded-[2rem] border-2 transition-all duration-300 relative group ${
                        serviceType === option.value
                          ? 'border-quali-primary bg-quali-primary/10'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className={`mb-2 md:mb-3 transform group-hover:scale-110 transition-transform ${serviceType === option.value ? 'text-white' : 'text-gray-600'}`}>{option.icon}</div>
                      <div className={`text-[8px] md:text-[10px] font-black tracking-widest text-center ${serviceType === option.value ? 'text-white' : 'text-gray-500'}`}>
                        {option.label}
                      </div>
                    </button>
                  ))}
               </div>

               <div className="animate-scale-in">
                  {serviceType === 'dine-in' && (
                    <div className="space-y-4 md:space-y-6">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4 flex items-center">
                        <Users className="h-3 w-3 mr-2" /> Party Size
                      </label>
                      <div className="flex items-center space-x-4 md:space-x-6 bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/10 w-fit mx-auto lg:mx-0">
                        <button
                          onClick={() => setPartySize(Math.max(1, partySize - 1))}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-xl text-white hover:bg-white/10 border border-white/5"
                        >
                          -
                        </button>
                        <div className="flex flex-col items-center min-w-[3rem] md:min-w-[4rem]">
                           <span className="text-2xl md:text-3xl font-black text-white italic">{partySize}</span>
                        </div>
                        <button
                          onClick={() => setPartySize(Math.min(20, partySize + 1))}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-xl text-white hover:bg-white/10 border border-white/5"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {serviceType === 'pickup' && (
                    <div className="space-y-4 md:space-y-6">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4 flex items-center">
                        <Clock className="h-3 w-3 mr-2" /> Pickup Estimate
                      </label>
                      <div className="grid grid-cols-4 gap-2 md:gap-4">
                        {['10M', '20M', '30M', 'SPEC'].map((label, idx) => {
                          const values = ['5-10', '15-20', '25-30', 'custom'];
                          return (
                            <button
                              key={label}
                              onClick={() => setPickupTime(values[idx])}
                              className={`py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all font-black text-[8px] md:text-[10px] tracking-widest ${
                                pickupTime === values[idx]
                                  ? 'border-quali-primary bg-quali-primary/10 text-white'
                                  : 'border-white/5 bg-white/[0.02] text-gray-500'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      
                      {pickupTime === 'custom' && (
                        <input
                          type="text"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm md:text-base font-bold italic"
                          placeholder="Specify custom time..."
                        />
                      )}
                    </div>
                  )}

                  {serviceType === 'delivery' && (
                    <div className="space-y-4 md:space-y-8">
                       <div className="space-y-3">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4 flex items-center">
                          <MapPin className="h-3 w-3 mr-2" /> Delivery Address
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] px-6 md:px-8 py-4 md:py-6 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm md:text-base font-bold italic"
                          placeholder="Unit, Street, Barangay, City..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 md:mt-10 space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest ml-4 flex items-center">
                      <MessageSquare className="h-3 w-3 mr-2" /> Order Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] px-6 md:px-8 py-4 md:py-6 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm md:text-base font-bold italic"
                      placeholder="Special requests or allergies..."
                      rows={2}
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl">
               <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase mb-8 md:mb-10 flex items-center">
                  <div className="w-1 h-5 md:h-6 bg-quali-primary mr-3 md:mr-4 rounded-full" />
                  Order Summary
               </h2>

               <div className="space-y-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 md:pr-4 mb-8 md:mb-10 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between group">
                       <div className="flex-1 pr-4">
                          <h4 className="text-xs md:text-sm font-black text-white italic uppercase tracking-tighter group-hover:text-quali-primary transition-colors leading-tight">{item.name}</h4>
                          <p className="text-[8px] md:text-[10px] font-black text-gray-500 mt-1 tracking-widest">
                             {item.quantity} x ₱{item.totalPrice}
                          </p>
                       </div>
                       <span className="text-xs md:text-sm font-black text-white tabular-nums">₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
               </div>

               <div className="border-t border-white/10 pt-8 md:pt-10">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                     <span className="text-base md:text-lg font-black text-white italic uppercase tracking-tighter">Subtotal</span>
                     <span className="text-2xl md:text-3xl font-black text-quali-primary italic">₱{totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={!isDetailsValid}
                    className={`w-full py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 transform border border-white/10 shadow-xl ${
                      isDetailsValid
                        ? 'bg-quali-gradient text-white hover:shadow-[0_0_40px_rgba(154,202,60,0.3)] hover:scale-[1.02]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Payment
                  </button>
               </div>
            </div>

            <div className="bg-quali-primary/5 rounded-[2rem] p-6 md:p-8 border border-quali-primary/10 flex items-center space-x-5 md:space-x-6">
               <div className="p-3 md:p-4 bg-quali-primary/10 rounded-xl md:rounded-2xl border border-quali-primary/20">
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-quali-primary" />
               </div>
               <div>
                  <h4 className="text-[10px] md:text-xs font-black text-white tracking-widest">Secure Dispatch</h4>
                  <p className="text-[8px] md:text-[9px] font-black text-gray-500 tracking-widest mt-1">Verified Order Protocol</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-24 animate-fade-in text-pretendard">
       <div className="flex flex-col lg:flex-row items-center justify-between mb-12 md:mb-16 gap-8">
           <div className="flex items-center space-x-6 w-full lg:w-auto">
              <button
                title="Back"
                onClick={() => setStep('details')}
                className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/10 group"
              >
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-1 uppercase leading-none">Payment <span className="text-quali-primary">Terminal</span></h1>
                <p className="text-[9px] md:text-[10px] font-black text-gray-500 tracking-[0.4em]">Step 2: Resource Allocation</p>
              </div>
           </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-12 space-y-10 md:space-y-12">
          {activePayments.length === 0 ? (
            <div className="bg-white/5 rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-20 text-center border-2 border-dashed border-white/10">
               <Wallet className="h-12 w-12 md:h-16 md:w-16 text-gray-600 mx-auto mb-6 opacity-30" />
               <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] md:text-xs">No active payment gateways</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {activePayments.map((method) => (
                 <div key={method.id} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl relative group hover:border-quali-primary/30 transition-all">
                    <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-6 md:mb-8 text-center">{method.name}</h3>
                    
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8 flex flex-col items-center shadow-inner max-w-[240px] mx-auto">
                       <img 
                          src={method.qr_code_url} 
                          alt="QR Code"
                          className="w-full aspect-square object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                          }}
                        />
                       <p className="text-[8px] md:text-[10px] font-black text-gray-400 tracking-widest mt-4">Scan QR to Transfer</p>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                       <div className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[8px] md:text-[9px] font-black text-gray-500 tracking-widest mb-1">Account Holder</span>
                          <span className="text-xs md:text-sm font-black text-white uppercase italic">{method.account_name}</span>
                       </div>
                       <div className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[8px] md:text-[9px] font-black text-gray-500 tracking-widest mb-1">Reference Number</span>
                          <span className="text-xs md:text-sm font-black text-white font-mono tracking-wider">{method.account_number}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

           <div className="max-w-4xl mx-auto w-full bg-quali-primary/10 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-quali-primary/20 shadow-2xl text-center relative overflow-hidden">
              <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-4 md:mb-6 leading-tight">Confirm & <span className="text-quali-primary">Place Order</span></h2>
              <p className="text-gray-400 font-bold text-xs md:text-sm mb-8 md:mb-10 max-w-sm md:max-w-lg mx-auto">
                 Complete the transfer, screenshot the confirmation, and we'll verify it in our secure Messenger protocol.
              </p>

              <button
                onClick={handlePlaceOrder}
                className="w-full sm:w-auto bg-quali-gradient text-white px-8 md:px-12 py-5 md:py-7 rounded-xl md:rounded-[2rem] font-black text-base md:text-lg uppercase tracking-[0.2em] transform hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(154,202,60,0.3)] transition-all duration-300 border border-white/10 flex items-center justify-center space-x-3 md:space-x-4 mx-auto group"
              >
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:rotate-12" />
                <span>Transmit Order</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
