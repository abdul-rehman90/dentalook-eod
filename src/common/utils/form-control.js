import Input from '../components/input/input';
import Select from '../components/select/select';
import RadioButtons from '../components/radio/radio';
import DatePicker from '../components/date-picker/date-picker';
import TimePicker from '../components/time-picker/time-picker';

export const FormControl = (props) => {
  const { control, ...rest } = props;
  switch (control) {
    case 'input':
      return <Input {...rest} />;
    case 'select':
      return <Select {...rest} />;
    case 'radio':
      return <RadioButtons {...rest} />;
    case 'date':
      return <DatePicker {...rest} />;
    case 'time':
      return <TimePicker {...rest} />;
    default:
      return null;
  }
};
