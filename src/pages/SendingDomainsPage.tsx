import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchableSelect } from '../components/SearchableSelect';
import { DomainRow } from '../components/domains/DomainRow';
import { QueuesTable } from '../components/domains/QueuesTable';
import type { Domain, QueuePool, QueueData, QueueInfoResponse } from '../types/domain';
import styles from '../styles/SendingDomains.module.css';
import mockData from '../../domainResponse.json';
import { buildIpAddresses, getMappedDomainData } from './util/DomainsUtil';

export function SendingDomainsPage() {
  // State management for domains and UI
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainNames, setDomainNames] = useState<string[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIPs, setAvailableIPs] = useState<string[]>([]);
  const [queueInfo, setQueueInfo] = useState<QueueInfoResponse['data'] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    getDomains();
  },[]);

  useEffect(() => {
    setDomainNames(domains.map(domain => domain.domainName));
  }, [domains]);

  const getDomains = async () => {
    try {
      const domains = await getMappedDomainData();
      setDomains(domains);
      setAvailableIPs(buildIpAddresses(domains));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve domains');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleEdit = (domain: Domain) => {
    navigate(`/domain-editor/${domain.domainName}`, {
      state: { 
        domain, 
        allAvailableIPs: availableIPs 
      }
    });
  };

  const handleDelete = async (domain: Domain) => {
    if (!window.confirm(`Are you sure you want to delete ${domain.domainName}?`)) {
      return;
    }
    try {
      setIsLoading(true);
      await fetch(`http://localhost:5000/domains/${domain.domainName}`, {
        method: 'DELETE',
      });
      await getDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/domain-editor', { 
      state: { 
        domain: null,
        allAvailableIPs: availableIPs,
      } 
    });
  };

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleQueueClick = (queuePool: QueuePool) => {
    // Handle queue click - implement as needed
    // console.log('Queue clicked:', queuePool);
  };

  // Filter domains based on search term
  const filteredDomains = domains.filter(domain =>
    domain.domainName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Sending Domains</h1>
        <button className={styles.addButton} onClick={handleAdd}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Domain
        </button>
      </div>

      <div className="mb-6">
        <SearchableSelect
          options={domains.map(domain => domain.domainName)}
          placeholder="Search domains..."
          onChange={(selected) => setSearchTerm(selected[0] || '')}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className={styles.table}>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 w-8"></th>
                <th className="text-left p-4">Domain</th>
                <th className="text-left p-4">IP Addresses</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDomains.map((domain) => (
                <React.Fragment key={domain.domainName}>
                  <DomainRow
                    domain={domain}
                    isExpanded={expandedDomains.includes(domain.domainName)}
                    onToggle={() => toggleDomain(domain.domainName)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {expandedDomains.includes(domain.domainName) && (
                    <tr>
                      <td colSpan={4} className={styles.expandedRow}>
                        <QueuesTable
                          queuePools={domain.queuePools}
                          onQueueClick={handleQueueClick}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 