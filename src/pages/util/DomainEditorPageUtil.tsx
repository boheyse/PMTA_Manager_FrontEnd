import { Domain, Section, Setting } from "../../types/domain";


export function createVMTASectionStart(sectionValue: string, newStartIndex: number, ipAddress: string, subDomain: string, domainKey: string, domain: string): Section {
    return {
      key: 'virtual-mta',
      type: 'section_start',
      value: sectionValue,
      index: newStartIndex,
      content: [{
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

  export function createVMTAPoolSectionStart(poolName: string): Section {
    return {
      key: 'virtual-mta-pool',
      type: 'section_start',
      value: poolName,
      index: 0,
      content: []
    };
  }

  export function createSectionStart(key: string, sectionValue: string, newStartIndex: number): Section {
    return {
      key: key,
      type: "section_start",
      value: sectionValue,
      index: newStartIndex,
      content: []
    };
  }

  export function createSectionEnd(key: string, newEndIndex: number): Section {
    return {
      key: key,
      type: 'section_end',
      value: '',
      index: newEndIndex,
      content: []
    };
  }

  export function createVMTAPoolSetting(sectionValue: string): Setting {
    return {
        key: "virtual-mta",
        type: "setting",
        value: `${sectionValue}`,
        data: []
    };
  }



  export function getSectionFromFile(fileName: string, type: string, key: string, value: string, fileData: any) {
    const pool = fileData[fileName];
    if (pool) {
      return pool.find((section: Section) => section.type === type && section.key === key && section.value === value);
    }
    return null;
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