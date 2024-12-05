import { Domain, Section } from "../../types/domain";


export function createVMTASection(sectionValue: string, newStartIndex: number, ipAddress: string, subDomain: string, domainKey: string, domain: string): Section {
    return {
      key: 'virtual-mta',
      type: 'section',
      value: sectionValue,
      index: newStartIndex,
      sections: [{
        "key": "smtp-source-host",
        "type": "setting",
        "value": `${ipAddress} ${subDomain}`,
        "data": []
      },{
        "key": "domain-key",
        "type": "setting",
        "value": `${domainKey},${domain},/etc/pmta/dkim/${domainKey}.${domain}`,
        "data": []
      }]
    };
  }

  export function createSection(key: string, sectionValue: string, newStartIndex: number): Section {
    return {
      key: key,
      type: "section",
      value: sectionValue,
      index: newStartIndex,
      sections: [],
      data: []
    };
  }

  export function createVMTAPoolSetting(sectionValue: string): Section {
    return {
        key: "virtual-mta",
        type: "setting",
        value: `${sectionValue}`
          };
  }

  export function getLastIndex(file: any, key: string) {
    return file.length > 0 
      ? Math.max(
          ...file
            .filter(section => section.key === key)
            .map(section => section.index),
          0 // Default value when no sections match
        )
      : 0; // Return 0 if the file is empty
  }  