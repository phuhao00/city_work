import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { EnhancedButton, EnhancedCard } from '../ui';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    this.props.onError?.(error, errorInfo);

    // 错误上报
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }

    // 控制台输出详细错误信息
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
  }

  // 错误上报
  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location?.href || 'react-native',
        errorId: this.state.errorId,
      };

      // 这里可以发送到错误监控服务
      console.log('Error Report:', errorReport);
      
      // 示例：发送到错误监控服务
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  // 重试处理
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  // 重新加载应用
  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      // React Native 环境下的重启逻辑
      Alert.alert(
        '重启应用',
        '需要重启应用来恢复正常功能',
        [
          { text: '取消', style: 'cancel' },
          { text: '重启', onPress: () => {
            // 在实际项目中可以使用 react-native-restart
            console.log('Restart app');
          }},
        ]
      );
    }
  };

  // 发送反馈
  private handleSendFeedback = () => {
    const { error, errorInfo, errorId } = this.state;
    
    Alert.alert(
      '发送错误反馈',
      `错误ID: ${errorId}\n\n您可以将此错误ID发送给开发团队以获得帮助。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '复制错误ID', onPress: () => {
          // 在实际项目中可以使用 Clipboard
          console.log('Copy error ID:', errorId);
        }},
        { text: '发送反馈', onPress: () => {
          // 打开反馈页面或发送邮件
          console.log('Send feedback for error:', errorId);
        }},
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showErrorDetails={this.props.showErrorDetails}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onSendFeedback={this.handleSendFeedback}
        />
      );
    }

    return this.props.children;
  }
}

// 错误回退UI组件
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showErrorDetails?: boolean;
  onRetry: () => void;
  onReload: () => void;
  onSendFeedback: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  showErrorDetails = false,
  onRetry,
  onReload,
  onSendFeedback,
}) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 20,
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: 10,
    },
    message: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
    },
    errorId: {
      fontSize: 12,
      color: '#999',
      textAlign: 'center',
      marginBottom: 30,
      fontFamily: 'monospace',
    },
    buttonContainer: {
      marginBottom: 20,
    },
    button: {
      marginBottom: 12,
    },
    detailsContainer: {
      marginTop: 20,
    },
    detailsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    errorText: {
      fontSize: 12,
      color: '#666',
      fontFamily: 'monospace',
      lineHeight: 16,
    },
    scrollContainer: {
      maxHeight: 200,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={64} color="#ff6b6b" />
      </View>
      
      <Text style={styles.title}>出现了一些问题</Text>
      
      <Text style={styles.message}>
        应用遇到了意外错误。我们已经记录了这个问题，请尝试以下操作来恢复正常使用。
      </Text>
      
      <Text style={styles.errorId}>错误ID: {errorId}</Text>
      
      <View style={styles.buttonContainer}>
        <EnhancedButton
          title="重试"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
          icon="refresh"
        />
        
        <EnhancedButton
          title="重新加载应用"
          onPress={onReload}
          variant="outline"
          style={styles.button}
          icon="reload"
        />
        
        <EnhancedButton
          title="发送反馈"
          onPress={onSendFeedback}
          variant="outline"
          style={styles.button}
          icon="mail"
        />
      </View>
      
      {showErrorDetails && error && (
        <EnhancedCard style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>错误详情</Text>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.errorText}>
              {error.message}
              {'\n\n'}
              {error.stack}
              {errorInfo && '\n\n组件堆栈:\n'}
              {errorInfo?.componentStack}
            </Text>
          </ScrollView>
        </EnhancedCard>
      )}
    </View>
  );
};

// 高阶组件包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error handling
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error);
    
    // 这里可以添加错误上报逻辑
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
  }, []);

  return handleError;
}

// 异步错误捕获Hook
export function useAsyncError() {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;