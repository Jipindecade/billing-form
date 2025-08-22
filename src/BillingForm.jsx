import './BillingForm.css';
import React, { useState, useEffect, useRef } from 'react';

const COUNTRIES = [
  {"name":"Austria","code":"at","emoji":"🇦🇹","dialCode":"+43","phoneRegex":/^\d{4,13}$/},
  {"name":"Belgium","code":"be","emoji":"🇧🇪","dialCode":"+32","phoneRegex":/^4\d{8}$|^\d{8,9}$/},
  {"name":"Bulgaria","code":"bg","emoji":"🇧🇬","dialCode":"+359","phoneRegex":/^\d{7,9}$/},
  {"name":"Croatia","code":"hr","emoji":"🇭🇷","dialCode":"+385","phoneRegex":/^\d{8,12}$/},
  {"name":"Cyprus","code":"cy","emoji":"🇨🇾","dialCode":"+357","phoneRegex":/^(9\d{7}|2\d{7})$/},
  {"name":"Czech Republic","code":"cz","emoji":"🇨🇿","dialCode":"+420","phoneRegex":/^\d{9,12}$/},
  {"name":"Denmark","code":"dk","emoji":"🇩🇰","dialCode":"+45","phoneRegex":/^\d{8}$/},
  {"name":"Estonia","code":"ee","emoji":"🇪🇪","dialCode":"+372","phoneRegex":/^\d{7,10}$/},
  {"name":"Finland","code":"fi","emoji":"🇫🇮","dialCode":"+358","phoneRegex":/^\d{5,12}$/},
  {"name":"France","code":"fr","emoji":"🇫🇷","dialCode":"+33","phoneRegex":/^[1-9]\d{8}$/},
  {"name":"Germany","code":"de","emoji":"🇩🇪","dialCode":"+49","phoneRegex":/^\d{6,13}$/},
  {"name":"Greece","code":"gr","emoji":"🇬🇷","dialCode":"+30","phoneRegex":/^\d{10}$/},
  {"name":"Hungary","code":"hu","emoji":"🇭🇺","dialCode":"+36","phoneRegex":/^\d{8,9}$/},
  {"name":"Iceland","code":"is","emoji":"🇮🇸","dialCode":"+354","phoneRegex":/^\d{7,9}$/},
  {"name":"Ireland","code":"ie","emoji":"🇮🇪","dialCode":"+353","phoneRegex":/^\d{7,11}$/},
  {"name":"Italy","code":"it","emoji":"🇮🇹","dialCode":"+39","phoneRegex":/^\d{6,12}$/},
  {"name":"Latvia","code":"lv","emoji":"🇱🇻","dialCode":"+371","phoneRegex":/^\d{8}$/},
  {"name":"Liechtenstein","code":"li","emoji":"🇱🇮","dialCode":"+423","phoneRegex":/^\d{7,12}$/},
  {"name":"Lithuania","code":"lt","emoji":"🇱🇹","dialCode":"+370","phoneRegex":/^\d{8}$/},
  {"name":"Luxembourg","code":"lu","emoji":"🇱🇺","dialCode":"+352","phoneRegex":/^\d{8,9}$/},
  {"name":"Malta","code":"mt","emoji":"🇲🇹","dialCode":"+356","phoneRegex":/^\d{8}$/},
  {"name":"Netherlands","code":"nl","emoji":"🇳🇱","dialCode":"+31","phoneRegex":/^6\d{8}$|^\d{9}$/},
  {"name":"Norway","code":"no","emoji":"🇳🇴","dialCode":"+47","phoneRegex":/^\d{8}$/},
  {"name":"Poland","code":"pl","emoji":"🇵🇱","dialCode":"+48","phoneRegex":/^\d{9}$/},
  {"name":"Portugal","code":"pt","emoji":"🇵🇹","dialCode":"+351","phoneRegex":/^\d{9,11}$/},
  {"name":"Romania","code":"ro","emoji":"🇷🇴","dialCode":"+40","phoneRegex":/^\d{9}$/},
  {"name":"Slovakia","code":"sk","emoji":"🇸🇰","dialCode":"+421","phoneRegex":/^\d{9}$/},
  {"name":"Slovenia","code":"si","emoji":"🇸🇮","dialCode":"+386","phoneRegex":/^\d{8}$/},
  {"name":"Spain","code":"es","emoji":"🇪🇸","dialCode":"+34","phoneRegex":/^[679]\d{8}$/},
  {"name":"Sweden","code":"se","emoji":"🇸🇪","dialCode":"+46","phoneRegex":/^\d{7,13}$/},
  {"name":"United Kingdom","code":"gb","emoji":"🇬🇧","dialCode":"+44","phoneRegex":/^7\d{9}$/}
];/* （AI）特定国家特定区号，圆形图标，emoji国旗且国旗全覆盖圆形图标 */

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const flagUrl = (code) => `https://flagcdn.com/h20/${code}.png`;

const isValidDate = (d,m,y) => {
  if(!(y>=1900&&y<=2100)) return false;
  if(!(m>=1&&m<=12)) return false;
  const maxD=new Date(y,m,0).getDate();
  return d>=1&&d<=maxD;
};

export default function BillingForm(){
  const [formData,setFormData]=useState({fullName:'',dob:'',country:'',address:'',phone:''});
  const [nationalNumber,setNationalNumber]=useState('');
  const [selectedCountry,setSelectedCountry]=useState(null);
  const [isCountryPanelOpen,setCountryPanelOpen]=useState(false);
  const [countrySearch,setCountrySearch]=useState('');
  const [isDatePickerOpen,setDatePickerOpen]=useState(false);
  const [isSubmitDisabled,setSubmitDisabled]=useState(true);
  const [phoneError,setPhoneError]=useState('');
  const [isDobInvalid,setDobInvalid]=useState(false);
  const [datePickerView,setDatePickerView]=useState(()=>{ const t=new Date(); return {year:t.getFullYear(),month:t.getMonth()}; });
  const [selectedDate,setSelectedDate]=useState(null);
  const [monthMenuOpen,setMonthMenuOpen]=useState(false);
  const [yearMenuOpen,setYearMenuOpen]=useState(false);

  const countrySelectRef=useRef(null);
  const datePickerRef=useRef(null);

  useEffect(()=>{
    if(selectedCountry){
      setFormData(prev=>({...prev,phone:`${selectedCountry.dialCode} ${nationalNumber}`.trim()}));
    }
  },[selectedCountry,nationalNumber]);

  useEffect(()=>{
    const { fullName, dob, country, address } = formData;
    const dobValid=/^\d{2}\/\d{2}\/\d{4}$/.exec(dob);
    let isOk=fullName.trim()&&dobValid&&!isDobInvalid&&country;
    if(selectedCountry){
      const hasPhone = nationalNumber.replace(/\s+/g,'').length>0;
      isOk = isOk && address.trim() && hasPhone;
    }
    setSubmitDisabled(!isOk);
  },[formData,selectedCountry,isDobInvalid,nationalNumber]);

  useEffect(()=>{
    if(formData.dob.length===10){
      const [d,m,y]=formData.dob.split('/').map(v=>parseInt(v,10));
      const valid = isValidDate(d,m,y);
      setDobInvalid(!valid);
      if(valid){
        const dt=new Date(y,m-1,d);
        setSelectedDate(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()));
        setDatePickerView({year:dt.getFullYear(),month:dt.getMonth()});
      }
    }else{
      setDobInvalid(false);
    }
  },[formData.dob]);

  useEffect(()=>{
    function handleClickOutside(e){
      const isInsideDate = datePickerRef.current && datePickerRef.current.parentElement.contains(e.target);
      const isInsideCountry = countrySelectRef.current && countrySelectRef.current.contains(e.target);
      if(!isInsideCountry) setCountryPanelOpen(false);
      if(!isInsideDate){
        setDatePickerOpen(false);
        setMonthMenuOpen(false);
        setYearMenuOpen(false);
      }
    }
    document.addEventListener('mousedown',handleClickOutside);
    return ()=>document.removeEventListener('mousedown',handleClickOutside);
  },[]);

  const handleInputChange=(e)=>{
    const {id,value}=e.target;
    if(id==='dob'){
      const currentDigits=formData.dob.replace(/\D/g,'');
      let newDigits=value.replace(/\D/g,'');
      if(newDigits.length<currentDigits.length){ setFormData(p=>({...p,dob:value})); return; }
      if(newDigits.length>8) newDigits=newDigits.slice(0,8);
      let formattedDob=newDigits;
      if(newDigits.length>4) formattedDob=`${newDigits.slice(0,2)}/${newDigits.slice(2,4)}/${newDigits.slice(4)}`;
      else if(newDigits.length>2) formattedDob=`${newDigits.slice(0,2)}/${newDigits.slice(2)}`;
      setFormData(p=>({...p,dob:formattedDob}));
    }else{
      setFormData(p=>({...p,[id]:value}));
    }
  };

  const handleNationalNumberChange=(e)=>{
    const value=e.target.value;
    if(/^[0-9\s]*$/.test(value)){
      setNationalNumber(value);
      setPhoneError('');
    }
  };

  const handleCountrySelect=(country)=>{
    setSelectedCountry(country);
    setNationalNumber('');
    setFormData(p=>({...p,country:country.name,phone:country.dialCode}));
    setPhoneError('');
    setCountryPanelOpen(false);
  };

  const validatePhoneStrict = ()=>{
    if(!selectedCountry) return true;
    const digits = nationalNumber.replace(/\s+/g,'');
    const ok = selectedCountry.phoneRegex ? selectedCountry.phoneRegex.test(digits) : true;
    if(!ok){
      setPhoneError('Please enter a valid phone number.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit=(e)=>{
    e.preventDefault();
    if(!validatePhoneStrict()) return;
    console.log('Form is valid and ready for submission:', formData);
  };

  const filteredCountries=COUNTRIES.filter(c=>c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  const openDatepickerToToday = ()=>{
    const t=new Date();
    setDatePickerView({year:t.getFullYear(), month:t.getMonth()});
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    setDatePickerOpen(true);
  };

  const changeMonth=(delta)=>{
    const nd=new Date(datePickerView.year,datePickerView.month+delta,1);
    setDatePickerView({year:nd.getFullYear(),month:nd.getMonth()});
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
  };

  const renderDatePicker=()=>{
    const {year,month}=datePickerView;
    const start=new Date(year,month,1);
    const firstDayOfWeek=start.getDay();
    const days=Array.from({length:42},(_,i)=>{
      const day=i-firstDayOfWeek+1;
      const date=new Date(year,month,day);
      return {date,day:date.getDate(),isCurrentMonth:date.getMonth()===month};
    });

    const handleDayClick=(date)=>{
      const dd=String(date.getDate()).padStart(2,'0');
      const mm=String(date.getMonth()+1).padStart(2,'0');
      const yyyy=date.getFullYear();
      setFormData(p=>({...p,dob:`${dd}/${mm}/${yyyy}`}));
      setSelectedDate(new Date(date.getFullYear(),date.getMonth(),date.getDate()));
      setMonthMenuOpen(false);
      setYearMenuOpen(false);
      setDatePickerOpen(false);
    };

    const isSameYMD = (a,b)=> a && b &&
      a.getFullYear()===b.getFullYear() &&
      a.getMonth()===b.getMonth() &&
      a.getDate()===b.getDate();

    const startYearBlock = year - ((year - 1900) % 12);
    const yearBlock = Array.from({length:12},(_,i)=>startYearBlock+i);

    return (
      <div className="datepicker" ref={datePickerRef}>
        <div className="dp-header">
          <div className="dp-title">
            <button type="button" className="dp-dd" onClick={()=>{setMonthMenuOpen(v=>!v); setYearMenuOpen(false);}}>
              {monthsShort[month]} <span className="dp-caret">▾</span>
            </button>
            <button type="button" className="dp-dd" onClick={()=>{setYearMenuOpen(v=>!v); setMonthMenuOpen(false);}}>
              {year} <span className="dp-caret">▾</span>
            </button>
          </div>
          <div className="dp-nav">
            <button type="button" onClick={()=>changeMonth(-1)}>‹</button>
            <button type="button" onClick={()=>changeMonth(1)}>›</button>
          </div>
        </div>

        {monthMenuOpen && (
          <div className="dp-pop">
            <div className="dp-month-grid">
              {monthsShort.map((m,idx)=>(
                <button
                  key={m}
                  type="button"
                  className={`dp-pill ${idx===month ? 'active' : ''}`}
                  onClick={()=>{ setDatePickerView(v=>({year:v.year,month:idx})); setMonthMenuOpen(false); }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {yearMenuOpen && (
          <div className="dp-pop">
            <div className="dp-year-grid">
              {yearBlock.map(y=>(
                <button
                  key={y}
                  type="button"
                  className={`dp-pill ${y===year ? 'active' : ''}`}
                  onClick={()=>{ setDatePickerView(v=>({year:y,month:v.month})); setYearMenuOpen(false); }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="dp-week">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="dp-wd">{d}</div>)}</div>

        <div className="dp-grid">
          {days.map((d,i)=>(
            <button
              key={i}
              type="button"
              className={`dp-day ${!d.isCurrentMonth?'muted':''} ${isSameYMD(d.date, selectedDate)?'selected':''}`}
              onClick={()=>handleDayClick(d.date)}
            >
              {d.day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="checkout">
      <div className="main-content">
        <div className="header">
          <div className="title">
            <a href="#!" className="back-link"><span className="chev">&lt;</span></a>
            Billing Information
          </div>
        </div>

        <form className="fields" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="fullName">Full name</label>
            <input className="input" type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} required />
          </div>

          <div className="field">
            <label className="label" htmlFor="dob">Date of Birth</label>
            <div className={`datewrap ${isDobInvalid ? 'invalid' : ''}`}>
              <input
                className="input"
                id="dob"
                placeholder="DD/MM/YYYY"
                value={formData.dob}
                onChange={handleInputChange}
                onFocus={openDatepickerToToday}
                autoComplete="off"
              />
              <button type="button" className="icon-btn" aria-label="Open calendar" onClick={()=> (isDatePickerOpen ? setDatePickerOpen(false) : openDatepickerToToday())}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" /></svg>
              </button>
              {isDatePickerOpen && renderDatePicker()}
            </div>
          </div>

          <div className="field full-width">
            <label className="label">Email</label>
            <input className="input" type="text" value="testttttt@radom.com" disabled />
          </div>

          <div className="field full-width">
            <label className="label">Country of residence</label>
            <div className="selectlike" onClick={()=>setCountryPanelOpen(!isCountryPanelOpen)} ref={countrySelectRef}>
              <div className="value">
                {selectedCountry ? (<><span className="flag"><img src={flagUrl(selectedCountry.code)} alt="" /></span><span>{selectedCountry.name}</span></>) : <span className="ph">Select country</span>}
              </div>
              <div className="caret"></div>
              {isCountryPanelOpen && (
                <div className="select-panel" onClick={e=>e.stopPropagation()}>
                  <div className={`select-search ${countrySearch ? 'has-value' : ''}`}>
                    <input type="text" placeholder="Search..." value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} />
                    <button type="button" className="clear" onClick={()=>setCountrySearch('')}>×</button>
                  </div>
                  <ul className="countryList">
                    {filteredCountries.length>0 ? filteredCountries.map(c=>(
                      <li key={c.code} onClick={()=>handleCountrySelect(c)}>
                        <span className="flag"><img src={flagUrl(c.code)} alt="" /></span><span>{c.name}</span>
                      </li>
                    )) : <li className="no-items">No Items</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {selectedCountry && (
            <>
              <div className="field full-width">
                <label className="label" htmlFor="address">Address</label>
                <input className="input" type="text" id="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="field full-width">
                <label className="label" htmlFor="phone">Phone number</label>
                <div className="phone-input-wrapper">
                  {selectedCountry && <span className="phone-prefix">{selectedCountry.dialCode}</span>}
                  <input
                    className="input"
                    type="tel"
                    id="phone"
                    value={nationalNumber}
                    onChange={handleNationalNumberChange}
                    required={!!selectedCountry}
                  />
                </div>
              </div>
            </>
          )}
        </form>
      </div>

      <div>
        <div className="sticky">
          <button className="btn" type="button" disabled={isSubmitDisabled} onClick={handleSubmit}>Continue to Summary</button>
          {phoneError && <div id="phone-error-banner">{phoneError}</div>}
        </div>
        <div className="footnote">
          <a className="footlink" href="https://www.radom.com/industries/igaming" target="_blank" rel="noopener noreferrer">
            <span>Powered by </span><strong>Radom</strong>
          </a>
        </div>
      </div>
    </div>
  );
}