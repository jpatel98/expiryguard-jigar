"use client";

import { motion } from "motion/react";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

import { useForm } from "react-hook-form"; // For form validation
import { useState, useEffect } from "react";
import axios from "axios"; // Axios for making HTTP requests
import { useDebounceCallback } from "usehooks-ts"; // Import the useDebounceCallback hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { IProduct } from "@/models/Product";
import { dbConnect } from "@/lib/dbConnect";
import { ProductScanner } from '@/components/ProductScanner'

const AddDelivery = () => {
  const [productList, setProductList] = useState<IProduct[]>([]); // Store the list of products fetched from backend
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null); // Store selected product
  const [qrCode, setQrCode] = useState(""); // Store QR code data
  const [productName, setProductName] = useState(""); // Search query
  const [showCreateProductForm, setShowCreateProductForm] = useState(false); // Flag to show the "Add New Product" form
  const [showProductList, setShowProductList] = useState(true);

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      productName: "",
      expiryDate: "",
      batchNumber: "",
      quantity: 0,
      storeLocation: "",
    },
  });
  const { setValue } = form;

  const debouncedSearch = useDebounceCallback(setProductName, 10);

  useEffect(() => {
    const getProducts = async () => {
      if (productName) {
        setShowProductList(true);
        try {
          const response = await axios.get(
            `/api/get-products?query=${productName}`
          );
          setProductList(response.data.products); // Set the products to the state
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      }
    };
    getProducts();
  }, [productName]);

  // Handle product selection from dropdown
  const handleProductSelect = (product: IProduct) => {
    setSelectedProduct(product);

    setValue("productName", product.productName, { shouldValidate: true });
    console.log("After setValue:", form.getValues("productName"));
    setShowProductList(false);
  };

  // Handle manual product entry
  const handleAddNewProduct = () => {
    setShowCreateProductForm(true); // Show the form to create a new product
  };

  // Function to trigger the print dialog for the QR code
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write("<html><body>");
      printWindow.document.write("<h2>QR Code</h2>");
      printWindow.document.write(
        '<img src="' + qrCode + '" width="200" height="200" />'
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await dbConnect();
      const response = await axios.post("/api/add-delivery", data); // Send delivery data to backend

      if (response.status === 200) {
        setQrCode(response.data.qrCode); // Set the QR code from the response
        alert("Delivery Added Successfully!");
      } else {
        alert("Failed to add delivery");
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Error submitting the delivery data.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Delivery</h1>
      <ProductScanner />
    </div>
  );
};

export default AddDelivery;
