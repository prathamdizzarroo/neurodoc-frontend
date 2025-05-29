import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

const formSchema = z.object({
  facilityName: z.string().min(1, { message: "Facility name is required" }),
  campusName: z.string().optional(),
  address: z.string().min(1, { message: "Facility address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State/Province is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  postalCode: z.string().min(1, { message: "Postal code is required" }),
  departmentName: z.string().optional(),
  departmentAddress: z.string().optional(),
  departmentPhone: z.string().optional(),
  departmentEmail: z.string().email().optional(),
});

const FacilityForm = ({ facility, onSubmit, onCancel }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facilityName: facility?.name || "",
      campusName: facility?.campusName || "",
      address: facility?.address?.street || "",
      city: facility?.address?.city || "",
      state: facility?.address?.state || "",
      country: facility?.address?.country || "",
      postalCode: facility?.address?.postalCode || "",
      departmentName: facility?.department?.name || "",
      departmentAddress: facility?.department?.address || "",
      departmentPhone: facility?.department?.phone || "",
      departmentEmail: facility?.department?.email || "",
    },
  });

  const handleSubmit = (data) => {
    onSubmit({
      name: data.facilityName,
      campusName: data.campusName,
      address: {
        street: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      },
      department: {
        name: data.departmentName,
        address: data.departmentAddress,
        phone: data.departmentPhone,
        email: data.departmentEmail,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="facilityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facility Name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Enter Facility Name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="campusName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Enter Campus Name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Address Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facility Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Enter Facility Address" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" placeholder="Enter City" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" placeholder="Enter State/Province" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" placeholder="Enter Country" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" placeholder="Enter Postal Code" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Department Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="departmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Enter Department Name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Enter Department Address" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" type="tel" placeholder="Enter Department Phone" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="pl-10" type="email" placeholder="Enter Department Email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {facility ? 'Update Facility' : 'Add Facility'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FacilityForm; 