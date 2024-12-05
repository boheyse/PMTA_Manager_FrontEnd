import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, Pagination, Form } from 'react-bootstrap';
import { DomainSearch } from '../../components/domain-registrar/DomainSearch';
import { DomainList } from '../../components/domain-registrar/DomainList';
import { DNSManager } from '../../components/domain-registrar/DNSManager';
import { RegistrarSettings } from '../../components/domain-registrar/RegistrarSettings';
import { axiosGet } from '../../utils/apiUtils';

interface Domain {
  created_on: string;
  id: string;
  modified_on: string;
  name: string;
  name_servers: string[];
  original_name_servers: string[];
  status: string;
}

interface ResultInfo {
  count: number;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

interface DomainsResponse {
  domains: Domain[];
  result_info: ResultInfo;
}

export function DomainRegistrarPage() {
  const [activeTab, setActiveTab] = useState('search');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [resultInfo, setResultInfo] = useState<ResultInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [sortOrder, setSortOrder] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(sortOrder && { order: sortOrder }),
        ...(sortDirection && { direction: sortDirection })
      });

      const response = await axiosGet(`/api/v1/cloudflare/domains?${queryParams}`);
      setDomains(response.domains);
      setFilteredDomains(response.domains);
      setResultInfo(response.result_info);
    } catch (err) {
      setError('Failed to fetch domains. Please try again later.');
      console.error('Error fetching domains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((domains.length === 0 || currentPage !== resultInfo?.page || perPage !== resultInfo?.per_page) && activeTab === 'domains') {
      fetchDomains();
    }
  }, [currentPage, perPage, sortOrder, sortDirection, activeTab, domains.length, resultInfo?.page]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!term.trim()) {
      debounceTimeout.current = setTimeout(() => {
        fetchDomains();
      }, 1000);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          per_page: perPage.toString(),
          ...(sortOrder && { order: sortOrder }),
          ...(sortDirection && { direction: sortDirection }),
          name: `contains:${term}`
        });

        const response = await axiosGet(`/api/v1/cloudflare/domains?${queryParams.toString()}`);
        setDomains(response.domains);
        setFilteredDomains(response.domains);
        setResultInfo(response.result_info);
      } catch (err) {
        setError('Failed to search domains. Please try again later.');
        console.error('Error searching domains:', err);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const renderPagination = () => {
    if (!resultInfo) return null;

    let items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(resultInfo.total_pages, startPage + maxVisiblePages - 1);

    // Add first page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Add last page
    if (endPage < resultInfo.total_pages) {
      if (endPage < resultInfo.total_pages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item
          key={resultInfo.total_pages}
          onClick={() => handlePageChange(resultInfo.total_pages)}
        >
          {resultInfo.total_pages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 bg-white border-b sticky top-0 z-10">
        <h1 className="text-2xl font-semibold mb-6">Domain Registrar</h1>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'search')}
          className="mb-4"
        >
          <Tab eventKey="search" title="Search & Register">
            <DomainSearch />
          </Tab>
          <Tab eventKey="domains" title="My Domains">
            {isLoading ? (
              <div className="text-center py-4">Loading domains...</div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 bg-white">
                  <div className="flex items-center gap-4">
                    <Pagination size="sm">
                      <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {renderPagination()}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === resultInfo?.total_pages}
                      />
                      <Pagination.Last
                        onClick={() => handlePageChange(resultInfo?.total_pages || 1)}
                        disabled={currentPage === resultInfo?.total_pages}
                      />
                    </Pagination>

                    <div className="text-sm text-gray-600 ml-4">
                      Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, resultInfo?.total_count || 0)} of {resultInfo?.total_count || 0} domains
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Form.Control
                      type="text"
                      placeholder="Search domains..."
                      value={searchTerm}
                      onChange={handleSearch}
                      size="sm"
                      style={{ width: '200px' }}
                    />

                    <Form.Select
                      size="sm"
                      value={perPage}
                      onChange={handlePerPageChange}
                      style={{ width: '100px' }}
                    >
                      <option value="10">10 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                      <option value="100">100 / page</option>
                    </Form.Select>
                  </div>
                </div>
              </>
            )}
          </Tab>
          <Tab eventKey="dns" title="DNS Manager">
            <DNSManager />
          </Tab>
          <Tab eventKey="settings" title="Settings">
            <RegistrarSettings />
          </Tab>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'domains' && !isLoading && !error && (
          <div className="p-6">
            <DomainList domains={filteredDomains} />
          </div>
        )}
        {activeTab === 'search' && (
          <div className="p-6">
            <DomainSearch />
          </div>
        )}
        {activeTab === 'dns' && (
          <div className="p-6">
            <DNSManager />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-6">
            <RegistrarSettings />
          </div>
        )}
      </div>
    </div>
  );
}