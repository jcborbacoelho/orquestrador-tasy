const RemoveFieldId = (objectFields: any) => {
  if (objectFields) {
    Object.keys(objectFields).forEach((key) => {
      if (key.indexOf('_id') > -1) {
        delete objectFields[key];
      }

      if (typeof objectFields[key] == 'object') {
        objectFields[key] = RemoveFieldId(objectFields[key]);
      }
    });
  }

  return objectFields;
};

const TextNormalizer = (canal: string, string: any) => {
  !string && Object.getPrototypeOf(this) === String.prototype
    ? (string = this)
    : void 0;
  !string ? (string = '') : void 0;
  let negrito = new RegExp(/<strong>(.*?)<\/strong>/g),
    italico = new RegExp(/<i>(.*?)<\/i>/g),
    enter = new RegExp(/<br>/g);

  let _negrito = '$1',
    _italico = '$1',
    _enter = '';

  if (
    canal == 'Channel::Twilio::Whatsapp' ||
    canal == 'Channel::Sinch::Whatsapp' ||
    canal == 'Channel::Meta::Whatsapp'
  ) {
    _negrito = '*$1*';
    _italico = '_$1_';
    _enter = '\n';
  }

  if (canal == 'Channel::WebWidget') {
    _negrito = '<b>$1</b>';
    _italico = '<i>$1</i>';
    _enter = '\\';
  }

  return string
    .replace(negrito, _negrito)
    .replace(italico, _italico)
    .replace(enter, _enter);
};

export { RemoveFieldId, TextNormalizer };
