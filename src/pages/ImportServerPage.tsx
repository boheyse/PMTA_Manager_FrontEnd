import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ServerDetailsForm } from '../components/server-manager/ServerDetailsForm';
import { axiosPost } from '../utils/apiUtils';
import { toast } from 'react-toastify';

export function ImportServerPage() {
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [hostname, setHostname] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError('');

    try {
      const connectResponse = await axiosPost('/api/v1/server/connect', {
        hostname: hostname,
        name: serverName,
        create_server: true,
      });

      if (connectResponse.session_id) {
        const ipResponse = await axiosPost('/api/v1/server/ip-addresses', {
          session_id: connectResponse.session_id,
        });

        setIpAddresses(ipResponse.ip_addresses);
        toast.success('Server imported successfully!');
        navigate('/manage-server');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(
        error.response?.data?.message || 'Failed to connect to server'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/manage-server')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">Import Existing Server</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ServerDetailsForm
          serverName={serverName}
          hostname={hostname}
          onServerNameChange={setServerName}
          onHostnameChange={setHostname}
          onSubmit={handleConnect}
          isConnecting={isConnecting}
          connectionError={connectionError}
          ipAddresses={ipAddresses}
          submitButtonText="Import Server"
        />
      </div>
    </div>
  );
}