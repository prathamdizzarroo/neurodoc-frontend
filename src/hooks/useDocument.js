import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { WORKFLOW_ACTIONS } from '@/constants/document';

export const useDocument = (document, onStatusChange) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWorkflowAction = async (action, data = {}) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/documents/${document.id}/workflow`, {
        action,
        userId: 'current-user-id', // Replace with actual user ID
        userName: 'Current User', // Replace with actual user name
        ...data
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Document ${action.toLowerCase().replace(/_/g, ' ')} successful`,
        });
        onStatusChange(response.data);
      }
    } catch (error) {
      console.error('Workflow action error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update document status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (reviewData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/documents/${document.id}/review`, {
        reviewerId: 'current-user-id', // Replace with actual user ID
        reviewerName: 'Current User', // Replace with actual user name
        ...reviewData,
      });

      if (response.status === 200) {
        toast({
          title: "Review Submitted",
          description: "Your review has been submitted successfully",
        });
        onStatusChange(response.data);
        return true;
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = async (approvalData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/documents/${document.id}/approve`, {
        approverId: 'current-user-id', // Replace with actual user ID
        approverName: 'Current User', // Replace with actual user name
        ...approvalData,
      });

      if (response.status === 200) {
        toast({
          title: "Approval Submitted",
          description: "Your approval has been submitted successfully",
        });
        onStatusChange(response.data);
        return true;
      }
    } catch (error) {
      console.error('Approval submission error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit approval",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleWorkflowAction,
    handleReview,
    handleApproval
  };
}; 