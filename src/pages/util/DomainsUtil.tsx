import { axiosGet } from '../../utils/apiUtils'; // Assuming your axiosGet is in an 'api.ts' file
import type { Domain, DomainResponse } from '../../types/domain';

// Get the domain data from the API and map it to the desired structure
export const getMappedDomainData = async (): Promise<Domain[]> => {
  const url = '/v1/domains';

  try {
    // Fetch the domainResponse from the API
    const domainResponse: DomainResponse = await axiosGet(url);

    // Map the response to the desired structure
    return domainResponse.domains.map((domain) => ({
      domainName: domain.domainName,
      ipAddresses: domain.ipAddresses,
      queuePools: domain.queuePools.map((pool) => ({
        fileName: pool.fileName,
        poolName: pool.poolName,
        poolType: pool.poolType,
        queues: pool.queues.map((queue) => ({
          info: queue.info.map((info) => ({
            domainKey: info.domainKey,
            domainKeyPath: info.domainKeyPath,
            domainName: info.domainName,
            ipAddress: info.ipAddress,
            host: info.host,
            subDomain: info.subDomain,
            queueName: info.queueName,
            queueType: info.queueType,
          })),
          sections: queue.sections.map((section) => ({
            content: section.content
              ? section.content.map((setting) => ({
                  data: setting.data || null,
                  key: setting.key || '',
                  type: setting.type || '', // Default to empty string if missing
                  value: setting.value || '',
                }))
              : [], // If content is null/undefined, map it to an empty array
            index: section.index,
            key: section.key || '', // Default to an empty string if key is null
            type: section.type,
            value: section.value || '', // Default to empty string
          })),
        })),
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
      queuePool.queues.forEach((queue) => {
        queue.info.forEach((info) => {
          ipSet.add(info.ipAddress); // Add ipAddress to the Set
        });
      });
    });
  });

  return Array.from(ipSet) as string[]; // Convert Set to Array if needed
}