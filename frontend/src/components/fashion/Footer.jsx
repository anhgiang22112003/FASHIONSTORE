import React, { memo } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerStyles = {
  footer: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
    color: '#a3a3a3',
    position: 'relative',
    overflow: 'hidden'
  },
  decorativeTop: {
    position: 'absolute' ,
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #ffc0cb 0%, #ff69b4 50%, #ffc0cb 100%)',
    opacity: 0.6
  },
  brandText: {
    background: 'linear-gradient(135deg, #ffc0cb 0%, #ff69b4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  contactIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#1f1f1f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  contactIconHover: {
    background: 'linear-gradient(135deg, #ffc0cb 0%, #ff69b4 100%)',
    boxShadow: '0 0 20px rgba(255, 192, 203, 0.4)'
  },
  socialLink: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#1f1f1f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  socialLinkHover: {
    background: 'linear-gradient(135deg, #ffc0cb 0%, #ff69b4 100%)',
    boxShadow: '0 0 25px rgba(255, 192, 203, 0.5)',
    transform: 'scale(1.1)'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '24px',
    position: 'relative' ,
    display: 'inline-block'
  },
  underline: {
    position: 'absolute' ,
    bottom: '-8px',
    left: 0,
    width: '48px',
    height: '2px',
    background: 'linear-gradient(90deg, #ffc0cb 0%, #ff69b4 100%)',
    borderRadius: '2px'
  },
  workingHoursCard: {
    background: 'rgba(31, 31, 31, 0.5)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #2a2a2a'
  },
  paymentBadge: {
    background: '#1f1f1f',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '11px',
    textAlign: 'center' ,
    transition: 'border-color 0.3s ease'
  },
  decorativeBottom: {
    position: 'absolute' ,
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ffc0cb 0%, #ff69b4 50%, #ffc0cb 100%)',
    opacity: 0.4
  }
};

const SocialLink = memo(({ 
  icon: Icon, 
  href, 
  label 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <a
      href={href}
      style={{
        ...footerStyles.socialLink,
        ...(isHovered ? footerStyles.socialLinkHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
    >
      <Icon style={{ width: '20px', height: '20px', transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.1)' : 'scale(1)' }} />
    </a>
  );
});

SocialLink.displayName = 'SocialLink';

const FooterLink = memo(({ 
  to, 
  children 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <li>
      <Link
        to={to}
        style={{
          color: isHovered ? '#ff69b4' : '#a3a3a3',
          transition: 'all 0.3s ease',
          display: 'inline-block',
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Link>
    </li>
  );
});

FooterLink.displayName = 'FooterLink';

const ContactItem = memo(({ 
  icon: Icon, 
  children 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        ...footerStyles.contactIcon,
        ...(isHovered ? footerStyles.contactIconHover : {})
      }}>
        <Icon style={{ 
          width: '16px', 
          height: '16px', 
          color: isHovered ? '#fff' : '#ff69b4',
          transition: 'color 0.3s ease'
        }} />
      </div>
      <span style={{ 
        fontSize: '14px',
        color: isHovered ? '#fff' : '#a3a3a3',
        transition: 'color 0.3s ease'
      }}>
        {children}
      </span>
    </div>
  );
});

ContactItem.displayName = 'ContactItem';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' }
  ];

  const quickLinks = [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Chính sách bảo mật', href: '#' },
    { name: 'Điều khoản sử dụng', href: '#' },
    { name: 'Chính sách đổi trả', href: '#' },
    { name: 'Hướng dẫn mua hàng', href: '#' }
  ];

  const categories = [
    'Thời trang nữ',
    'Thời trang nam',
    'Phụ kiện',
    'Giày dép',
    'Túi xách',
    'Đồng hồ'
  ];

  const paymentMethods = [
    'Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay', 'COD'
  ];

  return (
    <footer style={footerStyles.footer}>
      <div style={footerStyles.decorativeTop} />
      
      <div style={{ maxWidth: '1550px', margin: '0 auto', padding: '48px 16px', position: 'relative' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          {/* Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '16px',
                ...footerStyles.brandText
              }}>
                FASHIONSTORE
              </h3>
              <p style={{ 
                fontSize: '14px', 
                lineHeight: '1.6',
                color: '#a3a3a3'
              }}>
                Thương hiệu thời trang hàng đầu Việt Nam, mang đến những sản phẩm 
                chất lượng cao với thiết kế hiện đại và phong cách.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ContactItem icon={Phone}>Hotline: 1900 1234</ContactItem>
              <ContactItem icon={Mail}>contact@fashionstore.vn</ContactItem>
              <ContactItem icon={MapPin}>123 Nguyễn Huệ, Q1, TP.HCM</ContactItem>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {socialLinks.map((social) => (
                <SocialLink
                  key={social.label}
                  icon={social.icon}
                  href={social.href}
                  label={social.label}
                />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={footerStyles.sectionTitle}>
              Liên kết nhanh
              <span style={footerStyles.underline} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {quickLinks.map((link) => (
                <FooterLink key={link.name} to={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={footerStyles.sectionTitle}>
              Danh mục
              <span style={footerStyles.underline} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {categories.map((category) => {
                const [isHovered, setIsHovered] = React.useState(false);
                return (
                  <li key={category}>
                    <a
                      href="#"
                      style={{
                        color: isHovered ? '#ff69b4' : '#a3a3a3',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {category}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={footerStyles.sectionTitle}>
              Hỗ trợ khách hàng
              <span style={footerStyles.underline} />
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={footerStyles.workingHoursCard}>
                <p style={{ fontSize: '12px', color: '#a3a3a3', marginBottom: '8px' }}>Giờ làm việc:</p>
                <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>T2 - T6: 8:00 - 22:00</p>
                <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>T7 - CN: 9:00 - 21:00</p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', color: '#a3a3a3', marginBottom: '12px' }}>Phương thức thanh toán:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {paymentMethods.map((method) => {
                    const [isHovered, setIsHovered] = React.useState(false);
                    return (
                      <div
                        key={method}
                        style={{
                          ...footerStyles.paymentBadge,
                          borderColor: isHovered ? '#ff69b4' : '#2a2a2a'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        {method}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid rgba(42, 42, 42, 0.5)', 
          marginTop: '48px', 
          paddingTop: '32px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <p style={{ fontSize: '12px', color: '#a3a3a3' }}>
            © 2025 FashionStore. All rights reserved.
          </p>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12px' }}>
            {['Chính sách bảo mật', 'Điều khoản', 'Sitemap'].map((text) => {
              const [isHovered, setIsHovered] = React.useState(false);
              return (
                <a
                  key={text}
                  href="#"
                  style={{
                    color: isHovered ? '#ff69b4' : '#a3a3a3',
                    transition: 'color 0.3s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {text}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div style={footerStyles.decorativeBottom} />
    </footer>
  );
};

export default memo(Footer);
