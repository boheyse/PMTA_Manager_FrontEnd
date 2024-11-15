import { ChevronRight, ChevronDown, Edit, Trash2 } from 'lucide-react';
import styles from '../../styles/SendingDomains.module.css';
import type { Domain } from '../../types/domain';

interface DomainRowProps {
  domain: Domain;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
}

export function DomainRow({ domain, isExpanded, onToggle, onEdit, onDelete }: DomainRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
      <td className="p-4">
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </td>
      <td className="p-4">{domain.domainName}</td>
      <td className="p-4">
        {domain.ipAddresses?.length > 0 ? domain.ipAddresses.join(', ') : 'No IP addresses'}
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(domain);
            }}
            className={styles.actionButton + ' ' + styles.edit}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(domain);
            }}
            className={styles.actionButton + ' ' + styles.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
} 