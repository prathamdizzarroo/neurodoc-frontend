import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Eye, Users2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserForm from './UserForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { userService } from "@/services/user.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch users with error handling
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userService.getAllUsers();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response;
    },
    retry: 1
  });

  const users = usersResponse?.data || [];

  // Create/Update mutation
  const userMutation = useMutation({
    mutationFn: async (userData) => {
      const response = userData.id 
        ? await userService.updateUser(userData.id, userData)
        : await userService.createUser(userData);
      
      if (!response.success) {
        throw new Error(response.error || 'Operation failed');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: selectedUser ? "User updated successfully" : "User created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await userService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }) => {
      const response = await userService.updateUserStatus(userId, status);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update status');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast({
        title: "Success",
        description: "User status updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (user) => {
    setSelectedUser({
      ...user,
      id: user._id
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(user._id);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleStatusChange = (user, newStatus) => {
    statusMutation.mutate({ userId: user._id, status: newStatus });
  };

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Error loading users: {error.message}</div>
        <Button onClick={() => queryClient.invalidateQueries(['users'])}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-500">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg shadow-sm border px-3 py-2">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold">{users.length}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }} size="lg" className="shadow-sm">
            <Plus className="h-5 w-5 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle>Users Directory</CardTitle>
              <CardDescription>View and manage all user accounts</CardDescription>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'ACTIVE' ? 'success' : 
                                user.status === 'SUSPENDED' ? 'warning' : 'destructive'}
                        className="font-normal cursor-pointer"
                        onClick={() => handleStatusChange(user, 
                          user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(user)}
                          className="hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={(formData) => userMutation.mutate(formData)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NPI Number</p>
                    <p className="font-medium">{selectedUser.npiNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NPI Type</p>
                    <p className="font-medium">{selectedUser.npiType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium">{selectedUser.organization || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge 
                      variant={selectedUser.status === 'ACTIVE' ? 'success' : 
                              selectedUser.status === 'SUSPENDED' ? 'warning' : 'destructive'}
                      className="font-normal cursor-pointer"
                      onClick={() => handleStatusChange(selectedUser, 
                        selectedUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                      )}
                    >
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Address Information</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Mailing Address</h5>
                    {selectedUser.mailingAddress ? (
                      <div className="space-y-1">
                        <p>{selectedUser.mailingAddress.address}</p>
                        <p>{selectedUser.mailingAddress.city}, {selectedUser.mailingAddress.state} {selectedUser.mailingAddress.zip}</p>
                        <p>{selectedUser.mailingAddress.country}</p>
                        {selectedUser.mailingAddress.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {selectedUser.mailingAddress.phone}
                          </p>
                        )}
                        {selectedUser.mailingAddress.fax && (
                          <p className="text-sm text-muted-foreground">
                            Fax: {selectedUser.mailingAddress.fax}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No mailing address provided</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Practice Address</h5>
                    {selectedUser.practiceAddress ? (
                      <div className="space-y-1">
                        <p>{selectedUser.practiceAddress.address}</p>
                        <p>{selectedUser.practiceAddress.city}, {selectedUser.practiceAddress.state} {selectedUser.practiceAddress.zip}</p>
                        <p>{selectedUser.practiceAddress.country}</p>
                        {selectedUser.practiceAddress.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {selectedUser.practiceAddress.phone}
                          </p>
                        )}
                        {selectedUser.practiceAddress.fax && (
                          <p className="text-sm text-muted-foreground">
                            Fax: {selectedUser.practiceAddress.fax}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No practice address provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Taxonomy</h4>
                {selectedUser.taxonomy?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.taxonomy.map((item, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Code: {item.code}</p>
                          {item.primary && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {item.state && (
                          <p className="text-sm text-muted-foreground">
                            State: {item.state}
                          </p>
                        )}
                        {item.licenseNumber && (
                          <p className="text-sm text-muted-foreground">
                            License: {item.licenseNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No taxonomy information available</p>
                )}
              </div>

              {selectedUser.otherIdentifiers && selectedUser.otherIdentifiers.length > 0 && (
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-primary">Other Identifiers</h4>
                  <div className="space-y-2">
                    {selectedUser.otherIdentifiers.map((identifier, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <p className="font-medium">Number: {identifier.number}</p>
                        <p className="text-sm text-muted-foreground">
                          State: {identifier.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Issuer: {identifier.issuer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Assigned Studies</h4>
                {selectedUser.assignedStudies?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.assignedStudies.map(study => (
                      <div key={study._id} className="p-2 bg-muted rounded-md">
                        <p className="font-medium">{study.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Access Level: {study.accessLevel}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No assigned studies</p>
                )}
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-primary">Assigned Facilities</h4>
                {selectedUser.assignedFacilities?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.assignedFacilities.map(facility => (
                      <div key={facility._id} className="p-2 bg-muted rounded-md">
                        <p className="font-medium">{facility.name}</p>
                        <p className="text-sm text-muted-foreground">{facility.city}, {facility.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No assigned facilities</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement; 
 