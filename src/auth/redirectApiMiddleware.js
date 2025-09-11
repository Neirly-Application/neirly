function redirectApiBrowser(req, res, next) {
  try {
    const acceptHeader = req.get('Accept') || '';

    if (acceptHeader.includes('text/html')) {
      return res.redirect('/');
    }

    next();
  } catch (err) {
    console.error('Errore nel middleware redirectApiBrowser:', err);
    next();
  }
}

module.exports = redirectApiBrowser;