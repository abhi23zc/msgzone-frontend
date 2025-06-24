// "use client"
// import {
//     Card,
//     CardHeader,
//     CardBody,
//     CardFooter,
//     Typography,
//     Button,
// } from "@material-tailwind/react";
// import { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";

// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

// export default function ProductCard() {
//     const [amount, setamount] = useState(350);
//     const [loaded, setLoaded] = useState(false);

//     useEffect(() => {
//         const script = document.createElement("script");
//         script.src = "https://checkout.razorpay.com/v1/checkout.js";
//         script.async = true;
//         script.onload = () => {
//           setLoaded(true);
//         };
//         document.body.appendChild(script);
//       }, []);

//     // handlePayment Function
//     const handlePayment = async () => {
//         try {
//             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/order`, {
//                 method: "POST",
//                 headers: {
//                     "content-type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     amount
//                 })
//             });

//             const data = await res.json();
//             console.log(data);
//             handlePaymentVerify(data.data)
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     // handlePaymentVerify Function
//     const handlePaymentVerify = async (data:any) => {
//         const options = {
//             key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//             amount: data.amount,
//             currency: data.currency,
//             name: "Devknus",
//             description: "Test Mode",
//             order_id: data.id,
//             handler: async (response:any) => {
//                 console.log("response", response)
//                 try {
//                     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify`, {
//                         method: 'POST',
//                         headers: {
//                             'content-type': 'application/json'
//                         },
//                         body: JSON.stringify({
//                             razorpay_order_id: response.razorpay_order_id,
//                             razorpay_payment_id: response.razorpay_payment_id,
//                             razorpay_signature: response.razorpay_signature,
//                         })
//                     })

//                     const verifyData = await res.json();

//                     if (verifyData.message) {
//                         toast.success(verifyData.message)
//                     }
//                 } catch (error) {
//                     console.log(error);
//                 }
//             },
//             theme: {
//                 color: "#5f63b8"
//             }
//         };
//         const rzp1 = new window.Razorpay(options);
//         rzp1.open();
//     }
//     return (
//         <Card placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} className="mt-6 w-96 bg-[#222f3e] text-white">
//             {/* CardHeader */}
//             <CardHeader placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} className="relative h-96 bg-[#2C3A47]">
//                 {/* Image  */}
//                 <img
//                     src="https://codeswear.nyc3.cdn.digitaloceanspaces.com/tshirts/pack-of-five-plain-tshirt-white/1.webp"
//                     alt="card-image"
//                 />
//             </CardHeader>

//             {/* CardBody */}
//             <CardBody placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
//                 {/* Typography For Title */}
//                 <Typography placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} variant="h5" className="mb-2">
//                     My First Product
//                 </Typography>

//                 {/* Typography For Price  */}
//                 <Typography placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
//                     ₹350 <span className=" line-through">₹699</span>
//                 </Typography>
//             </CardBody>

//             {/* CardFooter  */}
//             <CardFooter placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} className="pt-0">
//                 {/* Buy Now Button  */}
//                 <Button placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onClick={handlePayment} className="w-full bg-[#1B9CFC]">Buy Now</Button>
//                 <Toaster/>
//             </CardFooter>
//         </Card>
//     );
// }

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page