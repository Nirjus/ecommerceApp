const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncerror");

//Create new Oreder

exports.newOrder = catchAsyncError(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
       
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });

    res.status(201).json({
        success:true,
        order,
    })
})

// Get Single Order

exports.getSingleOrder = catchAsyncError(async (req,res, next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("order not found with this Id",404));
    }

    res.status(200).json({
        success:true,
        order,
    });

})


// Get logged in User Order

exports.myOrders = catchAsyncError(async (req,res, next)=>{
    const orders= await Order.find({user:req.user._id})
    

    res.status(200).json({
        success:true,
        orders,
    });

})

// Get All Orders --Admin

exports.getAllOrders = catchAsyncError(async (req,res, next)=>{
    const orders= await Order.find()
    
    let totalAmount = 0;

    orders.forEach(order=>{
        totalAmount += order.totalPrice;
    });


    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });

});


// Update Order status --Admin
exports.updateOrder = catchAsyncError(async (req,res, next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("order not found with this Id",404));
    }
    
   if(order.orderStatus === "Delivered"){
    return next(new ErrorHandler("you Have already delivered this order",404))
   }

   order.orderItems.forEach(async (order)=>{
    await updateStock(order.product, order.quantity);
   });

   order.orderStatus = req.body.status;
     
   if(req.body.status === "Delivered"){
    order.deliveredAt = Date.now();
   }

   await order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
    });

});

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    product.Stock -= quantity;

   await product.save({validateBeforeSave:false})
}


// Delete Orders --Admin

exports.deleteOrders = catchAsyncError(async (req,res, next)=>{
    const order= await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("order not found with this Id",404));
    }
    
   await order.deleteOne();

    res.status(200).json({
        success:true,
       
    });

});