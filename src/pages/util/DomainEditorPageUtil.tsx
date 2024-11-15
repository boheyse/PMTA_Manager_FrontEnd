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

  export function createVMTAPoolSectionStart(poolName: string, newStartIndex: number, sectionValue: string): Section {
    return {
      key: 'virtual-mta-pool',
      type: 'section_start',
      value: poolName,
      index: newStartIndex,
      content: [{
        "key": "virtual-mta",
        "type": "setting",
        "value": `${sectionValue}`,
        "data": []
      }]
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

  export function createSectionEnd(key: string, newEndIndex: number): Section {
    return {
      key: key,
      type: 'section_end',
      value: '',
      index: newEndIndex,
      content: []
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
            -1
          )
        : -1;
  }

  export function getTargetISPs(sections: Section[]): { [key: string]: Section[] } {
    const targetISPs: { [key: string]: Section[] } = {};
    let currentVMTANode: string = '';
    let currentDomainSection: Section[] = [];

    sections.forEach((section) => {
      if (section.key === 'virtual-mta' && section.type === 'section_start') {
        currentVMTANode = section.value || '';
        targetISPs[currentVMTANode] = [];
      } else if (section.key === 'virtual-mta' && section.type === 'section_end') {
        currentVMTANode = '';
      } else if (currentVMTANode && section.key === 'domain') {
        if (section.type === 'section_start') {
          currentDomainSection = [section];
        } else if (section.type === 'section_end' && currentDomainSection.length > 0) {
          currentDomainSection.push(section);
          targetISPs[currentVMTANode].push(...currentDomainSection);
          currentDomainSection = [];
        }
      }
    });

    return targetISPs;
  }