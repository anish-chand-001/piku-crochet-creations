const logAdminAction = (req, action, details = '') => {
    const adminEmail = req.user?.email || req.admin?.email || 'unknown-admin';
    const suffix = details ? ` ${details}` : '';
    console.log(`ADMIN ACTION: ${adminEmail} ${action}${suffix}`);
};

module.exports = {
    logAdminAction
};
