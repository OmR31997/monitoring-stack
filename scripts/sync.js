const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetsPath = path.join(rootDir, 'targets', 'targets.json');

if (!fs.existsSync(targetsPath)) {
  console.error(`ERROR: Target file not found at ${targetsPath}`);
  process.exit(1);
}

const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

const regions = targets.regions || [];
const uniqueRegions = [...new Set(regions.map(r => r.region))];
const instanceList = [];

regions.forEach(r => {
  if (r.instances && Array.isArray(r.instances)) {
    r.instances.forEach(inst => {
      instanceList.push({
        id: inst,
        region: r.region,
        label: `${inst} (${r.name || r.region})`
      });
    });
  }
});

console.log('==============================================');
console.log(' Single Source of Truth Config Synchronizer');
console.log('==============================================');
console.log(`Regions Found     : ${uniqueRegions.join(', ')}`);
console.log(`Instances Found   : ${instanceList.map(i => i.id).join(', ')}`);

// 1. Generate YACE config.yml
const regionFormattedYaml = uniqueRegions.map(reg => `      - ${reg}`).join('\n');

const yaceYaml = `apiVersion: v1alpha1

static:
  - name: ec2-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/EC2
    metrics:
      - name: CPUUtilization
        statistics:
          - Average
          - Maximum
        period: 300
        length: 3600
      - name: NetworkIn
        statistics:
          - Average
        period: 300
        length: 3600
      - name: NetworkOut
        statistics:
          - Average
        period: 300
        length: 3600
      - name: DiskReadBytes
        statistics:
          - Average
        period: 300
        length: 3600
      - name: DiskWriteBytes
        statistics:
          - Average
        period: 300
        length: 3600
      - name: StatusCheckFailed
        statistics:
          - Maximum
        period: 300
        length: 3600

  - name: rds-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/RDS
    metrics:
      - name: CPUUtilization
        statistics:
          - Average
          - Maximum
        period: 300
        length: 3600
      - name: DatabaseConnections
        statistics:
          - Average
          - Maximum
        period: 300
        length: 3600
      - name: FreeableMemory
        statistics:
          - Average
        period: 300
        length: 3600
      - name: FreeStorageSpace
        statistics:
          - Average
        period: 300
        length: 3600
      - name: ReadIOPS
        statistics:
          - Average
        period: 300
        length: 3600
      - name: WriteIOPS
        statistics:
          - Average
        period: 300
        length: 3600
      - name: ReadLatency
        statistics:
          - Average
        period: 300
        length: 3600
      - name: WriteLatency
        statistics:
          - Average
        period: 300
        length: 3600

  - name: ecs-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/ECS
    metrics:
      - name: CPUUtilization
        statistics:
          - Average
          - Maximum
        period: 300
        length: 3600
      - name: MemoryUtilization
        statistics:
          - Average
          - Maximum
        period: 300
        length: 3600

  - name: elasticache-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/ElastiCache
    metrics:
      - name: CPUUtilization
        statistics:
          - Average
        period: 300
        length: 3600
      - name: FreeableMemory
        statistics:
          - Average
        period: 300
        length: 3600
      - name: CacheHits
        statistics:
          - Sum
        period: 300
        length: 3600
      - name: CacheMisses
        statistics:
          - Sum
        period: 300
        length: 3600
      - name: CurrConnections
        statistics:
          - Average
        period: 300
        length: 3600

  - name: s3-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/S3
    metrics:
      - name: BucketSizeBytes
        statistics:
          - Average
        period: 86400
        length: 86400
      - name: NumberOfObjects
        statistics:
          - Average
        period: 86400
        length: 86400

  - name: natgateway-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/NATGateway
    metrics:
      - name: BytesInFromSource
        statistics:
          - Sum
        period: 300
        length: 3600
      - name: BytesOutToDestination
        statistics:
          - Sum
        period: 300
        length: 3600
      - name: ErrorPortAllocation
        statistics:
          - Sum
        period: 300
        length: 3600

  - name: sns-metrics
    regions:
${regionFormattedYaml}
    namespace: AWS/SNS
    metrics:
      - name: NumberOfMessagesPublished
        statistics:
          - Sum
        period: 300
        length: 3600
      - name: NumberOfNotificationsFailed
        statistics:
          - Sum
        period: 300
        length: 3600
`;

const yacePath1 = path.join(rootDir, 'yace', 'config.yml');
fs.writeFileSync(yacePath1, yaceYaml);
console.log(`Updated: ${yacePath1}`);

// Update Grafana Dashboard
function updateDashboard(dashboardPath) {
  if (!fs.existsSync(dashboardPath)) return;
  const dash = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));

  const regionOptions = [
    { selected: true, text: "All", value: "$__all" },
    ...uniqueRegions.map(reg => {
      const regObj = regions.find(r => r.region === reg);
      return { selected: false, text: `${reg}${regObj ? ` (${regObj.name})` : ''}`, value: reg };
    })
  ];

  const instanceOptions = [
    { selected: true, text: "All", value: "$__all" },
    ...instanceList.map(inst => ({
      selected: false,
      text: inst.label,
      value: inst.id
    }))
  ];

  dash.templating = {
    list: [
      {
        allValue: ".*",
        current: { selected: true, text: ["All"], value: ["$__all"] },
        hide: 0,
        includeAll: true,
        label: "Region",
        multi: true,
        name: "region",
        options: regionOptions,
        query: uniqueRegions.join(', '),
        skipUrlSync: false,
        type: "custom"
      },
      {
        allValue: ".*",
        current: { selected: true, text: ["All"], value: ["$__all"] },
        hide: 0,
        includeAll: true,
        label: "Instance ID",
        multi: true,
        name: "instance_id",
        options: instanceOptions,
        query: instanceList.map(i => i.id).join(', '),
        skipUrlSync: false,
        type: "custom"
      }
    ]
  };

  fs.writeFileSync(dashboardPath, JSON.stringify(dash, null, 2));
  console.log(`Updated Dashboard: ${dashboardPath}`);
}

updateDashboard(path.join(rootDir, 'grafana', 'dashboards', 'aws-cloudwatch-yace.json'));

console.log('==============================================');
console.log(' SUCCESS: All configs and dashboards synced!');
console.log('==============================================');
