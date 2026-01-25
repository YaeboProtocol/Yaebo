"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ManufacturerApplication, 
  ApplicationStatus 
} from "@/types";
import { getApplications } from "@/lib/mock-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  SlidersHorizontal, 
  MoreHorizontal, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  XCircle,
  ArrowUpDown,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGES: Record<ApplicationStatus, { label: string, color: string, icon: React.ReactNode }> = {
  "Draft": {
    label: "Draft",
    color: "bg-slate-100 text-slate-800",
    icon: <FileText className="w-4 h-4" />
  },
  "Submitted": {
    label: "Submitted",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="w-4 h-4" />
  },
  "Under Review": {
    label: "Under Review",
    color: "bg-purple-100 text-purple-800",
    icon: <RefreshCw className="w-4 h-4" />
  },
  "Needs More Info": {
    label: "Needs More Info",
    color: "bg-amber-100 text-amber-800",
    icon: <AlertCircle className="w-4 h-4" />
  },
  "Accepted": {
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  "Rejected": {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />
  }
};

export function ApplicationDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<ManufacturerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "companyName">("newest");

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const filteredApplications = applications
    .filter(app => 
      (statusFilter === "All" || app.status === statusFilter) &&
      (searchTerm === "" || 
        app.companyInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.smeInfo.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.companyInfo.name.localeCompare(b.companyInfo.name);
    });

  const handleViewApplication = (id: string) => {
    router.push(`/diligence/applications/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "All")}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Needs More Info">Needs More Info</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="companyName">Company Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-background border rounded-lg p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No applications found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-background">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Company
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => setSortBy("companyName")}
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Submitted
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Funding Request</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  const status = STATUS_BADGES[application.status];
                  return (
                    <TableRow 
                      key={application.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewApplication(application.id)}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {application.companyInfo.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.smeInfo.jurisdiction}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {new Date(application.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} flex w-fit gap-1 items-center`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${application.investmentTerms.totalFundingAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{application.investmentTerms.minPeriod} months</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewApplication(application.id);
                              }}>
                                View Details
                              </DropdownMenuItem>
                              {application.status !== "Under Review" && (
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  Mark as Under Review
                                </DropdownMenuItem>
                              )}
                              {application.status !== "Needs More Info" && (
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  Request More Info
                                </DropdownMenuItem>
                              )}
                              {application.status !== "Accepted" && (
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  Accept Application
                                </DropdownMenuItem>
                              )}
                              {application.status !== "Rejected" && (
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  Reject Application
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
} 