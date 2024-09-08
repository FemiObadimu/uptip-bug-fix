const paystack = (request) => {
  const secrete_key = process.env.PAYSTACK_SECRET_KEY;

  const initialisePayment = (form, callbackFunc) => {
    const option = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        Authorization: `Bearer ${secrete_key}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
      form,
    };

    const callback = (er, resp, body) => callbackFunc(er, body);
    request.post(option, callback);
  };

  const verifyPayment = (ref, callbackFunc) => {
    const option = {
      url: `https://api.paystack.co/transaction/verify/${ref}`,
      headers: {
        Authorization: `Bearer ${secrete_key}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
    };

    const callback = (er, resp, body) => callbackFunc(er, body);
    request(option, callback);
  };

  return { initialisePayment, verifyPayment };
};

module.exports = paystack;
