import { axiosGet } from '../../utils/apiUtils'; // Assuming your axiosGet is in an 'api.ts' file
import type { Domain, DomainResponse } from '../../types/domain';

// Get the domain data from the API and map it to the desired structure
export const getMappedDomainData = async (): Promise<Domain[]> => {
  const url = '/api/v1/domains';

  try {
    // Fetch the domainResponse from the API
    const domainResponse: DomainResponse = await axiosGet(url);

    // Map the response to the desired structure
    return domainResponse.domains.map((domain) => ({
      domainName: domain.domainName,
      ipAddresses: domain.ipAddresses || [],
      queuePools: (domain.queuePools || []).map((pool) => ({
        fileName: pool.fileName || '',
        poolName: pool.poolName || '',
        poolType: pool.poolType || '',
        queues: {
          info: (pool.queues?.info || []).map((info) => ({
            domainKey: info.domainKey || '',
            domainKeyPath: info.domainKeyPath || '',
            domainName: info.domainName || '',
            ipAddress: info.ipAddress || '',
            queueName: info.queueName || '',
            queueType: info.queueType || '',
            sourceHost: info.sourceHost || '',
          })),
          sections: (pool.queues?.sections || []).map((section) => ({
            data: section.data || [],
            key: section.key || '',
            index: section.index || 0,
            sections: section.sections || [],
            type: section.type || '',
            value: section.value || '',
          })),
        },
      })),
    }));
  } catch (error) {
    console.error('Error fetching or mapping domain data:', error);
    throw error;
  }
};

export function buildIpAddresses(domains: Domain[]): string[] {
  const ipSet = new Set();
  // Loop over domains
  domains.forEach((domain) => {
    domain.queuePools.forEach((queuePool) => {
      queuePool.queues.info.forEach((info) => {
        ipSet.add(info.ipAddress); // Add ipAddress to the Set
      });
    });
  });

  return Array.from(ipSet) as string[]; // Convert Set to Array if needed
}