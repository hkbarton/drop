var _const = {
  manager: '',
  pulseUrl: '/pulse',
  pulseUrlWithManUpdate: '/pulse/:manager',
  syncUrl: '/sync/:prd/:from/:to',
  dropSignature: '_drop_distribute_deploy_system_',
  errCode: {
    fileNotFound: 'ENOENT',
    fileAlreadyExist: 'EEXIST',
    accessDeny: 'EACCES',
    addressInUse: 'EADDRINUSE'
  }
};

module.exports = _const;

